import { Skeleton } from '@/shared/components/ui/skeleton'

export function DetailLoadingSkeleton() {
  return (
    <div className="space-y-0 [&_[data-slot=skeleton]]:bg-zinc-200 [&_[data-slot=skeleton]]:ring-1 [&_[data-slot=skeleton]]:ring-zinc-300/70 dark:[&_[data-slot=skeleton]]:bg-zinc-700/45 dark:[&_[data-slot=skeleton]]:ring-zinc-600/40">
      <section className="relative overflow-hidden rounded-lg">
        <Skeleton className="h-[420px] w-full sm:h-[460px] md:h-[620px]" />
        <div className="absolute inset-0 flex min-h-[420px] flex-col justify-end gap-5 p-4 sm:min-h-[460px] sm:p-5 md:min-h-[620px] md:gap-6 md:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-4 md:max-w-2xl">
            <div className="space-y-3">
              <Skeleton className="h-12 w-[78vw] max-w-[280px] md:h-18 md:w-80" />
              <Skeleton className="h-4 w-56 md:h-5 md:w-72" />
            </div>

            <div className="flex items-center gap-1.5 overflow-hidden md:hidden">
              <Skeleton className="h-6 w-14 shrink-0 rounded-full" />
              <Skeleton className="h-6 w-12 shrink-0 rounded-full" />
              <Skeleton className="h-6 w-14 shrink-0 rounded-full" />
              <Skeleton className="h-6 w-12 shrink-0 rounded-full" />
            </div>

            <div className="hidden flex-wrap items-center gap-2 md:flex">
              <Skeleton className="h-7 w-18 rounded-full" />
              <Skeleton className="h-7 w-16 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-22 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-full md:w-[90%]" />
              <Skeleton className="h-4 w-[84%] md:w-[84%]" />
              <Skeleton className="hidden h-4 w-[68%] md:block md:w-[68%]" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-9 w-28 rounded-md" />
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
          </div>

          <div className="hidden w-36 shrink-0 overflow-hidden rounded-lg lg:block">
            <Skeleton className="aspect-[2/3] w-full" />
          </div>
        </div>
      </section>

      <section className="-mt-px flex justify-center">
        <div className="flex items-center gap-6 py-3">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-12" />
        </div>
      </section>

      <div className="mt-6 space-y-8 px-2 pb-6 md:px-3 md:pb-8">
        <section className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-14 rounded-full" />
            <Skeleton className="h-6 w-18 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <Skeleton key={`detail-skeleton-${index}`} className="h-14 w-full rounded-md" />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <Skeleton className="h-6 w-28" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <Skeleton key={`recommendation-skeleton-${index}`} className="aspect-[2/3] w-full rounded-lg" />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
