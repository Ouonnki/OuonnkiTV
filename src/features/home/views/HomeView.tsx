import {
  useTmdbNowPlaying,
  useTmdbMovieLists,
  useTmdbTvLists,
  useTmdbRecommendations,
} from '@/shared/hooks/useTmdb'
import { useFavoritesStore } from '@/features/favorites/store/favoritesStore'
import type { TmdbFavoriteItem } from '@/features/favorites/types/favorites'
import { FeaturedCarousel } from '../components/FeaturedCarousel'
import { ContinueWatching } from '../components/ContinueWatching'
import { MediaCarousel } from '../components/MediaCarousel'
import { useMemo } from 'react'

/**
 * HomeView - 首页视图
 */
export default function HomeView() {
  const favorites = useFavoritesStore(state => state.favorites)
  const { trending, loading } = useTmdbNowPlaying()
  const {
    nowPlaying,
    popular: popularMovies,
    topRated: topRatedMovies,
    upcoming,
    loading: movieLoading,
  } = useTmdbMovieLists()
  const {
    airingToday,
    popular: popularTv,
    topRated: topRatedTv,
    loading: tvLoading,
  } = useTmdbTvLists()
  const favoriteRecommendationSource = useMemo(() => {
    const tmdbFavorites = favorites.filter(
      (item): item is TmdbFavoriteItem => item.sourceType === 'tmdb',
    )

    if (tmdbFavorites.length === 0) {
      return null
    }
    const latestTmdbFavorite = tmdbFavorites.reduce((latest, item) =>
      item.updatedAt > latest.updatedAt ? item : latest,
    )

    return {
      id: latestTmdbFavorite.media.id,
      mediaType: latestTmdbFavorite.media.mediaType,
    }
  }, [favorites])
  const { recommendations, loading: recommendationsLoading } =
    useTmdbRecommendations(favoriteRecommendationSource)

  return (
    <div className="flex flex-col gap-6">
      {/* 首页趋势轮播 */}
      <FeaturedCarousel items={trending} loading={loading.trending} />
      {/* 继续观看 */}
      <ContinueWatching />
      {/* 猜你喜欢 */}
      <MediaCarousel title="猜你喜欢" items={recommendations} loading={recommendationsLoading} />
      {/* 正在热映 */}
      <MediaCarousel title="正在热映" items={nowPlaying} loading={movieLoading.nowPlaying} />
      {/* 最受欢迎的电影 */}
      <MediaCarousel
        title="最受欢迎的电影"
        items={popularMovies}
        loading={movieLoading.popularMovies}
      />
      {/* 口碑最佳的电影 */}
      <MediaCarousel
        title="口碑最佳的电影"
        items={topRatedMovies}
        loading={movieLoading.topRatedMovies}
      />
      {/* 即将上映 */}
      <MediaCarousel title="即将上映" items={upcoming} loading={movieLoading.upcomingMovies} />
      {/* 今日播出 */}
      <MediaCarousel title="今日播出" items={airingToday} loading={tvLoading.airingTodayTv} />
      {/* 最受欢迎的剧集 */}
      <MediaCarousel title="最受欢迎的剧集" items={popularTv} loading={tvLoading.popularTv} />
      {/* 口碑最佳的剧集 */}
      <MediaCarousel title="口碑最佳的剧集" items={topRatedTv} loading={tvLoading.topRatedTv} />
    </div>
  )
}
