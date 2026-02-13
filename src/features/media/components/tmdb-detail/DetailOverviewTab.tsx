import { MediaPosterCard } from '@/shared/components/common'
import { Badge } from '@/shared/components/ui/badge'
import { getPosterUrl } from '@/shared/lib/tmdb'
import { buildTmdbDetailPath } from '@/shared/lib/routes'
import type { TmdbMediaItem, TmdbMediaType } from '@/shared/types/tmdb'
import { getReleaseYear } from './helpers'
import { DetailInfoGrid } from './DetailInfoGrid'
import type { DetailGenre, DetailInfoField, DetailKeyword } from './types'

interface DetailOverviewTabProps {
  tmdbType: TmdbMediaType
  genres: DetailGenre[]
  keywordList: DetailKeyword[]
  coreInfoFields: DetailInfoField[]
  movieInfoFields: DetailInfoField[]
  tvInfoFields: DetailInfoField[]
  recommendationItems: TmdbMediaItem[]
}

export function DetailOverviewTab({
  tmdbType,
  genres,
  keywordList,
  coreInfoFields,
  movieInfoFields,
  tvInfoFields,
  recommendationItems,
}: DetailOverviewTabProps) {
  return (
    <>
      <section className="space-y-5">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">基础信息</h2>
          {genres.length > 0 || keywordList.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {genres.map(genre => (
                <Badge key={genre.id} variant="outline" className="rounded-full">
                  {genre.name}
                </Badge>
              ))}
              {keywordList.map(keyword => (
                <Badge key={keyword.id} variant="outline" className="rounded-full border-dashed">
                  {keyword.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">暂无类型或关键词标签</p>
          )}
        </div>

        <DetailInfoGrid fields={coreInfoFields} className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3" />

        {tmdbType === 'movie' && movieInfoFields.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-base font-medium">电影补充信息</h3>
            <DetailInfoGrid fields={movieInfoFields} className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4" />
          </div>
        )}

        {tmdbType === 'tv' && tvInfoFields.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-base font-medium">剧集补充信息</h3>
            <DetailInfoGrid fields={tvInfoFields} className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3" />
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">你可能还喜欢</h2>
        {recommendationItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {recommendationItems.map(item => (
              <MediaPosterCard
                key={`${item.mediaType}-${item.id}`}
                to={buildTmdbDetailPath(item.mediaType, item.id)}
                posterUrl={getPosterUrl(item.posterPath, 'w342') || null}
                title={item.title}
                year={getReleaseYear(item.releaseDate)}
                rating={item.voteAverage}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">当前没有可展示的相关推荐</p>
        )}
      </section>
    </>
  )
}
