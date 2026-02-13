import { getPosterUrl } from '@/shared/lib/tmdb'
import type { TmdbMediaType } from '@/shared/types/tmdb'
import type { DetailSeason } from './types'

interface DetailSeasonsTabProps {
  tmdbType: TmdbMediaType
  seasons: DetailSeason[]
}

export function DetailSeasonsTab({ tmdbType, seasons }: DetailSeasonsTabProps) {
  if (tmdbType !== 'tv') {
    return <p className="text-muted-foreground text-sm">电影类型没有季信息</p>
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">全部季信息</h2>
      {seasons.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {seasons.map(season => (
            <article key={season.id} className="border-border/40 flex gap-3 rounded-lg border p-3">
              <div className="border-border/35 aspect-[2/3] w-20 shrink-0 overflow-hidden rounded-lg border bg-zinc-200/40 dark:bg-zinc-800/40">
                {season.poster_path ? (
                  <img
                    src={getPosterUrl(season.poster_path, 'w185')}
                    alt={season.name}
                    className="block h-full w-full object-cover object-top"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-muted-foreground flex h-full w-full items-center justify-center text-[10px]">无海报</div>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1 text-sm">
                <p className="line-clamp-1 font-semibold">
                  S{season.season_number} · {season.name}
                </p>
                <p className="text-muted-foreground text-xs">Season ID: {season.id}</p>
                <p className="text-muted-foreground text-xs">
                  集数：{season.episode_count}
                  {season.air_date ? ` · 首播：${season.air_date}` : ''}
                </p>
                {season.overview && <p className="text-muted-foreground line-clamp-3 text-xs leading-5">{season.overview}</p>}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">当前剧集没有季列表数据</p>
      )}
    </section>
  )
}
