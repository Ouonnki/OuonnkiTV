import { NavLink } from 'react-router'
import { Star, CalendarDays, Clapperboard, Tv, Heart } from 'lucide-react'
import type { TmdbMediaItem, TmdbMediaType } from '@/shared/types/tmdb'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { MediaPosterCard } from '@/shared/components/common'
import { getPosterUrl } from '@/shared/lib/tmdb'
import { buildTmdbDetailPath } from '@/shared/lib/routes'

interface PlayerInfoAndRecommendationsProps {
  title: string
  originalTitle?: string
  overview: string
  sourceName: string
  modeLabel: string
  releaseDate?: string
  rating?: number
  posterPath?: string | null
  cmsCover?: string
  tmdbMediaType: TmdbMediaType | null
  seasonCount?: number
  episodeCount?: number
  detailLink?: string
  showRecommendations?: boolean
  favoriteAction?: {
    active: boolean
    onToggle: () => void
  }
  recommendations: TmdbMediaItem[]
}

export function PlayerInfoAndRecommendations({
  title,
  originalTitle,
  overview,
  sourceName,
  modeLabel,
  releaseDate,
  rating,
  posterPath,
  cmsCover,
  tmdbMediaType,
  seasonCount,
  episodeCount,
  detailLink,
  showRecommendations = true,
  favoriteAction,
  recommendations,
}: PlayerInfoAndRecommendationsProps) {
  const infoPoster = posterPath ? getPosterUrl(posterPath, 'w342') : cmsCover || ''

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-border/60 bg-card/45 p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">影视介绍</h2>
          <div className="flex items-center gap-2">
            {favoriteAction ? (
              <Button
                size="sm"
                variant={favoriteAction.active ? 'default' : 'secondary'}
                className="h-7 rounded-full px-2.5 text-xs"
                onClick={favoriteAction.onToggle}
              >
                <Heart className={favoriteAction.active ? 'size-3.5 fill-current' : 'size-3.5'} />
                {favoriteAction.active ? '已收藏' : '收藏'}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="space-y-3.5 md:space-y-4">
          <div className="flex flex-col gap-3 md:grid md:grid-cols-[180px_minmax(0,1fr)] md:gap-4">
            <div className="w-full">
              <div className="relative mx-auto aspect-[2/3] w-32 overflow-hidden rounded-lg border border-border/50 bg-muted/35 md:mx-0 md:w-full">
                {infoPoster ? (
                  <img
                    src={infoPoster}
                    alt={title}
                    className="absolute inset-0 block h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-muted-foreground flex h-full items-center justify-center text-sm">暂无海报</div>
                )}
              </div>

              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 md:hidden">
                <Badge variant="secondary" className="h-6 rounded-full px-2 text-[11px]">
                  {sourceName}
                </Badge>
                <Badge variant="outline" className="h-6 rounded-full px-2 text-[11px]">
                  {modeLabel}
                </Badge>
                {tmdbMediaType && (
                  <Badge variant="outline" className="h-6 rounded-full px-2 text-[11px]">
                    {tmdbMediaType === 'tv' ? '剧集内容' : '电影内容'}
                  </Badge>
                )}
                {releaseDate && (
                  <Badge variant="outline" className="h-6 rounded-full px-2 text-[11px]">
                    <CalendarDays className="size-3.5" />
                    {releaseDate.slice(0, 10)}
                  </Badge>
                )}
                {rating && rating > 0 ? (
                  <Badge variant="outline" className="h-6 rounded-full px-2 text-[11px]">
                    <Star className="size-3.5 text-amber-400" />
                    {rating.toFixed(1)}
                  </Badge>
                ) : null}
                {tmdbMediaType === 'tv' && seasonCount && episodeCount ? (
                  <Badge variant="outline" className="h-6 rounded-full px-2 text-[11px]">
                    <Tv className="size-3.5" />
                    共 {seasonCount} 季 / {episodeCount} 集
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-2.5 md:gap-3">
              <div className="space-y-1 text-center md:text-left">
                <h2 className="line-clamp-2 text-lg font-semibold md:text-2xl">{title}</h2>
                {originalTitle && originalTitle !== title && (
                  <p className="text-muted-foreground line-clamp-1 text-xs md:text-sm">{originalTitle}</p>
                )}
              </div>

              <div className="hidden flex-wrap items-center gap-2 md:flex">
                <Badge variant="secondary" className="px-2.5 text-xs">
                  {sourceName}
                </Badge>
                <Badge variant="outline" className="px-2.5 text-xs">
                  {modeLabel}
                </Badge>
                {tmdbMediaType && (
                  <Badge variant="outline" className="px-2.5 text-xs">
                    {tmdbMediaType === 'tv' ? '剧集内容' : '电影内容'}
                  </Badge>
                )}
                {releaseDate && (
                  <Badge variant="outline" className="px-2.5 text-xs">
                    <CalendarDays className="size-3.5" />
                    {releaseDate.slice(0, 10)}
                  </Badge>
                )}
                {rating && rating > 0 ? (
                  <Badge variant="outline" className="px-2.5 text-xs">
                    <Star className="size-3.5 text-amber-400" />
                    {rating.toFixed(1)}
                  </Badge>
                ) : null}
                {tmdbMediaType === 'tv' && seasonCount && episodeCount ? (
                  <Badge variant="outline" className="px-2.5 text-xs">
                    <Tv className="size-3.5" />
                    共 {seasonCount} 季 / {episodeCount} 集
                  </Badge>
                ) : null}
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-semibold">剧情介绍</h3>
                <p className="text-muted-foreground line-clamp-4 text-sm leading-6 md:line-clamp-6">{overview || '暂无剧情介绍'}</p>
              </div>
            </div>
          </div>

          {detailLink ? (
            <div className="mt-auto flex justify-end pt-0.5">
              <NavLink to={detailLink} className="text-muted-foreground text-xs hover:text-foreground">
                查看详情
              </NavLink>
            </div>
          ) : null}
        </div>
      </section>

      {showRecommendations && (
        <section className="space-y-3 rounded-lg border border-border/60 bg-card/45 p-4 md:p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Clapperboard className="size-4" />
              猜你还喜欢
            </h2>
            <NavLink to="/" className="text-muted-foreground text-xs hover:text-foreground">
              去首页查看更多
            </NavLink>
          </div>

          {recommendations.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {recommendations.slice(0, 12).map(item => (
                <MediaPosterCard
                  key={`${item.mediaType}-${item.id}`}
                  to={buildTmdbDetailPath(item.mediaType, item.id)}
                  posterUrl={getPosterUrl(item.posterPath, 'w342')}
                  title={item.title}
                  showTitle
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">暂无推荐内容</p>
          )}
        </section>
      )}
    </div>
  )
}
