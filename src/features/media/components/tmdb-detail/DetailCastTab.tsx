import { getPosterUrl } from '@/shared/lib/tmdb'
import type { DetailCast } from './types'

interface DetailCastTabProps {
  castList: DetailCast[]
}

export function DetailCastTab({ castList }: DetailCastTabProps) {
  return (
    <section className="-mx-1 space-y-4 md:-mx-2">
      <h2 className="px-1 text-lg font-semibold md:px-2">演员</h2>
      {castList.length > 0 ? (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {castList.map(cast => (
            <div key={cast.id} className="flex flex-col items-center gap-1.5 text-center">
              <div className="border-border/40 bg-muted/30 size-20 overflow-hidden rounded-full border md:size-24">
                {cast.profile_path ? (
                  <img
                    src={getPosterUrl(cast.profile_path, 'w185')}
                    alt={cast.name}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-muted-foreground flex size-full items-center justify-center text-[10px]">暂无</div>
                )}
              </div>
              <div className="space-y-0.5">
                <p className="line-clamp-1 text-sm font-medium">{cast.name}</p>
                {cast.character && <p className="text-muted-foreground line-clamp-1 text-xs">{cast.character}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground px-1 text-sm md:px-2">当前条目没有演员数据</p>
      )}
    </section>
  )
}
