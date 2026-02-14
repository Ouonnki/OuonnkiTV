import { Skeleton } from '@/shared/components/ui/skeleton'

interface PlayerLoadingSkeletonProps {
  mode?: 'tmdb' | 'cms'
}

export function PlayerLoadingSkeleton({ mode = 'tmdb' }: PlayerLoadingSkeletonProps) {
  const isTmdbMode = mode === 'tmdb'

  return (
    <div className="space-y-4 md:space-y-5">
      {isTmdbMode && (
        <section className="relative overflow-hidden rounded-lg border border-border/60 bg-card/45">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/10 via-transparent to-zinc-500/5" />

          <div className="relative z-10 flex min-h-[235px] flex-col justify-end p-3.5 pt-14 sm:min-h-[280px] sm:p-4 sm:pt-16 md:min-h-[340px] md:p-6 md:pt-16 lg:min-h-[400px] lg:p-7 lg:pt-20">
            <Skeleton className="absolute top-2.5 left-2.5 h-8 w-20 rounded-full sm:top-3 sm:left-3 sm:h-9 sm:w-24" />

            <div className="grid items-end gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_132px] lg:gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 overflow-hidden pb-1 sm:gap-2">
                  <Skeleton className="h-5 w-20 rounded-full sm:h-6 sm:w-24 md:h-7 md:w-28" />
                  <Skeleton className="h-5 w-16 rounded-full sm:h-6 sm:w-20 md:h-7 md:w-24" />
                  <Skeleton className="h-5 w-24 rounded-full sm:h-6 sm:w-28 md:h-7 md:w-32" />
                </div>

                <div className="space-y-1.5 sm:space-y-2 md:space-y-2.5">
                  <Skeleton className="h-7 w-[65%] max-w-[340px] sm:h-8 md:h-9" />
                  <Skeleton className="h-4 w-[92%] sm:h-5" />
                  <Skeleton className="h-4 w-[78%] sm:h-5" />
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Skeleton className="h-5 w-28 rounded-full sm:h-6 sm:w-32" />
                  <Skeleton className="h-5 w-24 rounded-full sm:h-6 sm:w-30" />
                </div>
              </div>

              <Skeleton className="hidden aspect-[2/3] w-full rounded-lg lg:block" />
            </div>
          </div>
        </section>
      )}

      <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="overflow-hidden rounded-lg border border-border/60 bg-card">
          <Skeleton className="aspect-video min-h-[180px] w-full sm:h-[clamp(240px,56vw,74vh)] sm:min-h-[220px] sm:aspect-auto" />
        </section>

        <aside className="xl:sticky xl:top-20 xl:h-[clamp(240px,56vw,74vh)] xl:min-h-[220px] xl:pr-1">
          {isTmdbMode ? (
            <div className="space-y-3 xl:flex xl:h-full xl:flex-col xl:gap-3 xl:space-y-0">
              <section className="overflow-hidden rounded-lg border border-border/60 bg-card/55">
                <div className="flex h-11 items-center justify-between px-3 md:px-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              </section>

              <section className="overflow-hidden rounded-lg border border-border/60 bg-card/55">
                <div className="flex h-11 items-center justify-between px-3 md:px-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              </section>

              <section className="overflow-hidden rounded-lg border border-border/60 bg-card/55 xl:flex xl:min-h-0 xl:flex-1 xl:flex-col">
                <div className="flex h-11 items-center justify-between border-b border-border/45 px-3 md:px-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-2 p-3 sm:gap-3 md:p-4 xl:flex-1 xl:content-start xl:overflow-hidden">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <Skeleton key={`player-episode-skeleton-${index}`} className="h-9 w-full rounded-md" />
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <section className="space-y-3 rounded-lg border border-border/60 bg-card/55 p-3 md:p-4 xl:h-full xl:min-h-0">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:content-start">
                {Array.from({ length: 12 }).map((_, index) => (
                  <Skeleton key={`player-cms-episode-skeleton-${index}`} className="h-9 w-full rounded-md" />
                ))}
              </div>
            </section>
          )}
        </aside>
      </section>

      <section className="space-y-3 rounded-lg border border-border/60 bg-card/45 p-4 md:p-5">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>

        <div className="space-y-3.5 md:space-y-4">
          <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 md:grid-cols-[180px_minmax(0,1fr)] md:gap-4">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            <div className="space-y-2.5 md:space-y-3">
              <div className="space-y-1">
                <Skeleton className="h-6 w-[70%] max-w-[320px]" />
                <Skeleton className="h-4 w-[45%] max-w-[220px]" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-[78%]" />
          </div>

          {isTmdbMode && (
            <div className="flex justify-end">
              <Skeleton className="h-4 w-14" />
            </div>
          )}
        </div>
      </section>

      {isTmdbMode && (
        <section className="space-y-3 rounded-lg border border-border/60 bg-card/45 p-4 md:p-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <Skeleton key={`player-rec-skeleton-${index}`} className="aspect-[2/3] w-full rounded-lg" />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
