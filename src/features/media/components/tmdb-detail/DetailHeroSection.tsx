import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  ExternalLink,
  Film,
  Flame,
  Heart,
  Play,
  Star,
  Tv,
} from 'lucide-react'
import { getBackdropUrl, getPosterUrl } from '@/shared/lib/tmdb'
import type { TmdbMediaItem, TmdbMediaType } from '@/shared/types/tmdb'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import type { DetailImage, TmdbRichDetail } from './types'

interface DetailHeroSectionProps {
  detail: Pick<
    TmdbMediaItem,
    'title' | 'overview' | 'posterPath' | 'backdropPath' | 'releaseDate' | 'voteAverage' | 'popularity'
  >
  richDetail: TmdbRichDetail
  tmdbType: TmdbMediaType
  releaseYear: string
  runtimeLabel: string
  adultLevel: string
  heroLogo: DetailImage | null
  favorited: boolean
  onBack: () => void
  onPlayNow: () => void
  onContinueWatching?: () => void
  continueWatchingLabel?: string
  continueWatchingProgressLabel?: string
  onToggleFavorite: () => void
}

export function DetailHeroSection({
  detail,
  richDetail,
  tmdbType,
  releaseYear,
  runtimeLabel,
  adultLevel,
  heroLogo,
  favorited,
  onBack,
  onPlayNow,
  onContinueWatching,
  continueWatchingLabel,
  continueWatchingProgressLabel,
  onToggleFavorite,
}: DetailHeroSectionProps) {
  const heroBadgeClass =
    'h-6 gap-1 px-2 text-[10px] leading-none text-white [&_svg]:size-3 md:h-7 md:gap-1.5 md:px-2.5 md:text-xs md:[&_svg]:size-3.5'
  const playNowLabel = onContinueWatching ? '从头播放' : '立即播放'

  return (
    <section className="relative overflow-hidden rounded-lg">
      {detail.backdropPath ? (
        <img
          src={getBackdropUrl(detail.backdropPath, 'w1280')}
          alt={detail.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950" />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 via-50% to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

      <Button
        variant="ghost"
        onClick={onBack}
        className="absolute top-4 left-4 z-20 h-8 rounded-full px-2.5 !bg-transparent text-white/90 transition-colors hover:!bg-transparent hover:text-primary dark:hover:!bg-transparent sm:h-9 sm:px-3"
      >
        <ArrowLeft className="size-4" />
        返回
      </Button>
      {richDetail.homepage && (
        <Button
          asChild
          variant="ghost"
          className="absolute top-4 right-24 z-20 h-8 rounded-full px-2.5 !bg-transparent text-white/90 transition-colors hover:!bg-transparent hover:text-white sm:right-16 sm:h-9 sm:px-3 md:right-4"
        >
          <a href={richDetail.homepage} target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" />
            <span className="md:hidden">官网</span>
            <span className="hidden md:inline">官方页面</span>
            <span className="sr-only md:hidden">官方页面</span>
          </a>
        </Button>
      )}
      <Button
        variant="ghost"
        className="absolute top-4 right-4 z-20 h-8 gap-1 rounded-full px-1.5 !bg-transparent text-white/90 hover:!bg-transparent hover:text-white focus-visible:!bg-transparent active:!bg-transparent sm:h-9 sm:px-2 md:hidden"
        onClick={onToggleFavorite}
        aria-label={favorited ? '取消收藏' : '加入收藏'}
      >
        <motion.span
          key={favorited ? 'mobile-favorited' : 'mobile-unfavorited'}
          initial={{ scale: 0.65, rotate: -14, opacity: 0.6 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 520, damping: 24 }}
        >
          <Heart className={`size-4 transition-colors ${favorited ? 'fill-rose-500 text-rose-500' : ''}`} />
        </motion.span>
        <span className="text-xs font-medium">{favorited ? '已收藏' : '收藏'}</span>
      </Button>

      <div className="relative z-10 flex min-h-[420px] flex-col justify-end gap-5 p-4 sm:min-h-[460px] sm:p-5 md:min-h-[620px] md:gap-6 md:p-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-4 md:max-w-2xl">
          <div className="space-y-3">
            {heroLogo ? (
              <img
                src={getPosterUrl(heroLogo.file_path, 'w500')}
                alt={detail.title}
                className="max-h-24 max-w-[78vw] object-contain sm:max-w-[320px] md:max-h-36 md:max-w-[420px]"
              />
            ) : (
              <h1 className="text-3xl leading-tight font-bold text-white md:text-5xl">{detail.title}</h1>
            )}
            {richDetail.tagline && <p className="text-sm italic text-white/80 md:text-base">{richDetail.tagline}</p>}
          </div>

          <div className="flex items-center gap-1.5 overflow-hidden text-xs md:hidden">
            <Badge className={`${heroBadgeClass} shrink-0 bg-white/20`}>
              {tmdbType === 'movie' ? (
                <>
                  <Film />
                  电影
                </>
              ) : (
                <>
                  <Tv />
                  剧集
                </>
              )}
            </Badge>
            {releaseYear && (
              <Badge className={`${heroBadgeClass} shrink-0 bg-white/20`}>
                <CalendarDays />
                {releaseYear}
              </Badge>
            )}
            {detail.voteAverage > 0 ? (
              <Badge className={`${heroBadgeClass} shrink-0 bg-white/20`}>
                <Star className="fill-current text-amber-300" />
                {detail.voteAverage.toFixed(1)}
              </Badge>
            ) : (
              <Badge className={`${heroBadgeClass} shrink-0 bg-white/20`}>
                <Flame className="text-orange-300" />
                {detail.popularity.toFixed(1)}
              </Badge>
            )}
            {adultLevel && (
              <Badge
                className={`${heroBadgeClass} shrink-0 ${adultLevel === 'NSFW' ? 'bg-red-500/80' : 'bg-emerald-500/80'}`}
              >
                {adultLevel}
              </Badge>
            )}
          </div>

          <div className="hidden flex-wrap items-center gap-2 text-sm md:flex">
            <Badge className={`${heroBadgeClass} bg-white/20 hover:bg-white/30`}>
              {tmdbType === 'movie' ? (
                <>
                  <Film />
                  电影
                </>
              ) : (
                <>
                  <Tv />
                  剧集
                </>
              )}
            </Badge>
            {releaseYear && (
              <Badge className={`${heroBadgeClass} bg-white/20 hover:bg-white/30`}>
                <CalendarDays />
                {releaseYear}
              </Badge>
            )}
            {detail.voteAverage > 0 && (
              <Badge className={`${heroBadgeClass} bg-white/20 hover:bg-white/30`}>
                <Star className="fill-current text-amber-300" />
                {detail.voteAverage.toFixed(1)}
              </Badge>
            )}
            <Badge className={`${heroBadgeClass} bg-white/20 hover:bg-white/30`}>
              <Flame className="text-orange-300" />
              热度 {detail.popularity.toFixed(1)}
            </Badge>
            {adultLevel && (
              <Badge
                className={`${heroBadgeClass} ${adultLevel === 'NSFW' ? 'bg-red-500/80 hover:bg-red-500' : 'bg-emerald-500/80 hover:bg-emerald-500'}`}
              >
                {adultLevel}
              </Badge>
            )}
            {runtimeLabel && (
              <Badge className={`${heroBadgeClass} bg-white/20 hover:bg-white/30`}>
                <Clock3 />
                {runtimeLabel}
              </Badge>
            )}
            {tmdbType === 'tv' && (
              <Badge className={`${heroBadgeClass} bg-white/20 hover:bg-white/30`}>
                {richDetail.number_of_seasons || 0} 季 / {richDetail.number_of_episodes || 0} 集
              </Badge>
            )}
          </div>

          <p className="line-clamp-2 text-sm leading-6 text-white/85 md:line-clamp-4 md:text-base">{detail.overview || '暂无简介'}</p>

          <div className="flex flex-wrap gap-3">
            {onContinueWatching ? (
              <Button
                className="group relative rounded-full bg-[#E50914] font-semibold text-white shadow-lg hover:bg-[#ca0812]"
                onClick={onContinueWatching}
              >
                <span className="inline-flex items-center gap-1.5 transition-opacity duration-200 group-hover:opacity-0">
                  <Play className="size-4 fill-current" />
                  继续观看
                  {continueWatchingLabel ? (
                    <span className="hidden sm:inline">· {continueWatchingLabel}</span>
                  ) : null}
                </span>
                {continueWatchingProgressLabel ? (
                  <span className="pointer-events-none absolute inset-0 hidden items-center justify-center text-xs font-semibold opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:flex">
                    {continueWatchingProgressLabel}
                  </span>
                ) : null}
              </Button>
            ) : null}
            <Button
              className="rounded-full bg-white font-semibold text-black shadow-lg hover:bg-white/90"
              onClick={onPlayNow}
            >
              <Play className="size-4" />
              {playNowLabel}
            </Button>
            <Button
              variant="outline"
              className="hidden rounded-full border-white/35 bg-white/12 font-semibold text-white hover:bg-white/20 hover:text-white md:inline-flex"
              onClick={onToggleFavorite}
            >
              <motion.span
                key={favorited ? 'favorited' : 'unfavorited'}
                initial={{ scale: 0.65, rotate: -14, opacity: 0.6 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 520, damping: 24 }}
              >
                <Heart className={`size-4 transition-colors ${favorited ? 'fill-rose-500 text-rose-500' : ''}`} />
              </motion.span>
              {favorited ? '已加入收藏' : '加入收藏'}
            </Button>
          </div>
        </div>

        <div className="hidden w-36 shrink-0 overflow-hidden rounded-lg border border-white/20 shadow-xl lg:block">
          {detail.posterPath ? (
            <img
              src={getPosterUrl(detail.posterPath, 'w342')}
              alt={detail.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="bg-muted text-muted-foreground flex aspect-[2/3] items-center justify-center text-xs">无海报</div>
          )}
        </div>
      </div>
    </section>
  )
}
