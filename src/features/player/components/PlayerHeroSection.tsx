import { ArrowLeft, Sparkles, Tv, Film } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { getBackdropUrl, getPosterUrl } from '@/shared/lib/tmdb'
import type { TmdbMediaType } from '@/shared/types/tmdb'

interface PlayerHeroSectionProps {
  modeLabel: string
  sourceName: string
  title: string
  overview: string
  posterPath?: string | null
  backdropPath?: string | null
  tmdbMediaType: TmdbMediaType | null
  currentEpisodeText: string
  totalEpisodeText: string
  onBack: () => void
}

export function PlayerHeroSection({
  modeLabel,
  sourceName,
  title,
  overview,
  posterPath,
  backdropPath,
  tmdbMediaType,
  currentEpisodeText,
  totalEpisodeText,
  onBack,
}: PlayerHeroSectionProps) {
  const mediaTypeText = tmdbMediaType === 'tv' ? '剧集' : tmdbMediaType === 'movie' ? '电影' : null

  return (
    <section className="relative overflow-hidden rounded-lg border border-border/60">
      {backdropPath ? (
        <img
          src={getBackdropUrl(backdropPath, 'w1280')}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/74 via-45% to-black/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/45 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(239,68,68,0.22),transparent_42%)]" />

      <Button
        variant="ghost"
        className="absolute top-2.5 left-2.5 z-20 h-8 rounded-full px-2.5 !bg-transparent text-white/90 transition-colors hover:!bg-transparent hover:text-white sm:top-3 sm:left-3 sm:h-9 sm:px-3"
        onClick={onBack}
      >
        <ArrowLeft className="size-4" />
        返回
      </Button>

      <div className="relative z-10 flex min-h-[235px] flex-col justify-end p-3.5 pt-14 sm:min-h-[280px] sm:p-4 sm:pt-16 md:min-h-[340px] md:p-6 md:pt-16 lg:min-h-[400px] lg:p-7 lg:pt-20">
        <div className="grid items-end gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_132px] lg:gap-6">
          <div className="space-y-4 lg:max-w-4xl">
            <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1 sm:gap-2">
              <Badge className="h-5 shrink-0 rounded-full bg-white/16 px-2 text-[10px] text-white hover:bg-white/24 sm:h-6 sm:px-2.5 sm:text-[11px] md:h-7 md:px-3 md:text-xs">
                {modeLabel}
              </Badge>
              {mediaTypeText && (
                <Badge className="h-5 shrink-0 rounded-full bg-white/16 px-2 text-[10px] text-white hover:bg-white/24 sm:h-6 sm:px-2.5 sm:text-[11px] md:h-7 md:px-3 md:text-xs">
                  {tmdbMediaType === 'tv' ? <Tv className="size-3.5" /> : <Film className="size-3.5" />}
                  {mediaTypeText}
                </Badge>
              )}
              <Badge className="h-5 shrink-0 rounded-full bg-red-600/88 px-2 text-[10px] text-white hover:bg-red-600 sm:h-6 sm:px-2.5 sm:text-[11px] md:h-7 md:px-3 md:text-xs">
                <Sparkles className="size-3.5" />
                {sourceName}
              </Badge>
            </div>

            <div className="space-y-1.5 sm:space-y-2 md:space-y-2.5">
              <h1 className="line-clamp-2 text-xl leading-tight font-semibold tracking-tight text-white sm:text-2xl md:text-3xl lg:text-4xl">
                {title}
              </h1>
              <p className="line-clamp-2 text-xs leading-5 text-white/80 sm:line-clamp-3 sm:text-sm sm:leading-6 md:line-clamp-4 md:text-[15px]">
                {overview || '暂无剧情简介'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:gap-2 sm:text-xs md:text-sm">
              <Badge className="h-5 rounded-full bg-white/16 px-2 text-white hover:bg-white/22 sm:h-auto sm:px-3">
                当前 {currentEpisodeText}
              </Badge>
              <Badge className="h-5 rounded-full bg-white/16 px-2 text-white hover:bg-white/22 sm:h-auto sm:px-3">
                总计 {totalEpisodeText}
              </Badge>
            </div>
          </div>

          {posterPath ? (
            <div className="hidden overflow-hidden rounded-lg border border-white/20 bg-black/35 shadow-xl lg:block">
              <img src={getPosterUrl(posterPath, 'w342')} alt={title} className="aspect-[2/3] w-full object-cover" />
            </div>
          ) : (
            <div className="hidden lg:block" />
          )}
        </div>
      </div>
    </section>
  )
}
