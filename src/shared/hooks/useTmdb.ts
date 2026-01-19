import { useEffect, useState, useCallback } from 'react'
import { useTmdbStore } from '../store/tmdbStore'
import { getTmdbClient, normalizeToMediaItem } from '../lib/tmdb'
import type { TmdbMediaType, TmdbMovieDetail, TmdbTvDetail } from '../types/tmdb'

/**
 * 搜索功能 Hook
 */
export function useTmdbSearch() {
  const query = useTmdbStore(state => state.searchQuery)
  const results = useTmdbStore(state => state.searchResults)
  const filteredResults = useTmdbStore(s => s.filteredResults)
  const pagination = useTmdbStore(s => s.searchPagination)
  const loading = useTmdbStore(s => s.loading.search)
  const filterOptions = useTmdbStore(s => s.filterOptions)
  const availableOptions = useTmdbStore(s => s.availableFilterOptions)

  const search = useTmdbStore(s => s.search)
  const setFilter = useTmdbStore(s => s.setFilter)
  const clearFilter = useTmdbStore(s => s.clearFilter)

  return {
    query,
    results,
    filteredResults,
    pagination,
    loading,
    filterOptions,
    availableOptions,
    search,
    setFilter,
    clearFilter,
  }
}

/**
 * 热映/热门 Hook
 */
export function useTmdbNowPlaying() {
  const movies = useTmdbStore(s => s.nowPlayingMovies)
  const tv = useTmdbStore(s => s.popularTv)
  const trending = useTmdbStore(s => s.trending)
  const loading = useTmdbStore(s => s.loading)

  const fetchNowPlaying = useTmdbStore(s => s.fetchNowPlaying)
  const fetchTrending = useTmdbStore(s => s.fetchTrending)

  useEffect(() => {
    // 惰性加载，如果有数据暂不刷新，或者可以添加 forceRefresh 参数
    if (movies.length === 0) fetchNowPlaying()
    if (trending.length === 0) fetchTrending()
  }, [fetchNowPlaying, fetchTrending, movies.length, trending.length])

  return {
    movies,
    tv,
    trending,
    loading,
    refreshNowPlaying: fetchNowPlaying,
    refreshTrending: fetchTrending,
  }
}

/**
 * 电影榜单 Hook (正在热映/最受欢迎/口碑最佳/即将上映)
 */
export function useTmdbMovieLists() {
  const nowPlaying = useTmdbStore(s => s.nowPlayingMovies)
  const popular = useTmdbStore(s => s.popularMovies)
  const topRated = useTmdbStore(s => s.topRatedMovies)
  const upcoming = useTmdbStore(s => s.upcomingMovies)
  const loading = useTmdbStore(s => s.loading)

  const fetchNowPlaying = useTmdbStore(s => s.fetchNowPlaying)
  const fetchPopular = useTmdbStore(s => s.fetchPopularMovies)
  const fetchTopRated = useTmdbStore(s => s.fetchTopRatedMovies)
  const fetchUpcoming = useTmdbStore(s => s.fetchUpcomingMovies)

  useEffect(() => {
    if (nowPlaying.length === 0) fetchNowPlaying()
    if (popular.length === 0) fetchPopular()
    if (topRated.length === 0) fetchTopRated()
    if (upcoming.length === 0) fetchUpcoming()
  }, [
    nowPlaying.length,
    popular.length,
    topRated.length,
    upcoming.length,
    fetchNowPlaying,
    fetchPopular,
    fetchTopRated,
    fetchUpcoming,
  ])

  return {
    nowPlaying,
    popular,
    topRated,
    upcoming,
    loading,
    refreshNowPlaying: fetchNowPlaying,
    refreshPopular: fetchPopular,
    refreshTopRated: fetchTopRated,
    refreshUpcoming: fetchUpcoming,
  }
}

/**
 * 剧集榜单 Hook (今日播出/最受欢迎/口碑最佳)
 */
export function useTmdbTvLists() {
  const airingToday = useTmdbStore(s => s.airingTodayTv)
  const popular = useTmdbStore(s => s.popularTv)
  const topRated = useTmdbStore(s => s.topRatedTv)
  const loading = useTmdbStore(s => s.loading)

  const fetchAiringToday = useTmdbStore(s => s.fetchAiringTodayTv)
  const fetchPopular = useTmdbStore(s => s.fetchPopularTv)
  const fetchTopRated = useTmdbStore(s => s.fetchTopRatedTv)

  useEffect(() => {
    if (airingToday.length === 0) fetchAiringToday()
    if (popular.length === 0) fetchPopular()
    if (topRated.length === 0) fetchTopRated()
  }, [
    airingToday.length,
    popular.length,
    topRated.length,
    fetchAiringToday,
    fetchPopular,
    fetchTopRated,
  ])

  return {
    airingToday,
    popular,
    topRated,
    loading,
    refreshAiringToday: fetchAiringToday,
    refreshPopular: fetchPopular,
    refreshTopRated: fetchTopRated,
  }
}

/**
 * 详情 Hook (独立状态，不存入 Global Store)
 */
export function useTmdbDetail<T extends TmdbMovieDetail | TmdbTvDetail>(
  id: number | undefined,
  mediaType: TmdbMediaType,
  language = 'zh-CN',
) {
  const [detail, setDetail] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetail = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)
    const client = getTmdbClient()

    try {
      let data: unknown
      const options = { language, append_to_response: 'credits,recommendations,similar' }

      if (mediaType === 'movie') {
        // @ts-expect-error: options type mismatch
        data = await client.movies.details(id, options)
      } else {
        // @ts-expect-error: options type mismatch
        data = await client.tvShows.details(id, options)
      }

      // 简单转换，保留大部分原始字段，同时确保基础 MediaItem 字段存在
      const rawData = data as Record<string, unknown>
      const base = normalizeToMediaItem(rawData, mediaType)
      const fullDetail = { ...rawData, ...base } // 合并原始数据和归一化数据

      setDetail(fullDetail as T)
    } catch (err: unknown) {
      setError((err as Error).message || 'Fetch detail failed')
    } finally {
      setLoading(false)
    }
  }, [id, mediaType, language])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  return { detail, loading, error, refetch: fetchDetail }
}

/**
 * 分类/配置 Hook
 */
export function useTmdbGenres() {
  const movieGenres = useTmdbStore(s => s.movieGenres)
  const tvGenres = useTmdbStore(s => s.tvGenres)
  const loading = useTmdbStore(s => s.loading.genres)
  const fetchGenres = useTmdbStore(s => s.fetchGenresAndCountries)

  useEffect(() => {
    if (movieGenres.length === 0) {
      fetchGenres()
    }
  }, [fetchGenres, movieGenres.length])

  const getGenreName = useCallback(
    (id: number) => {
      const g = movieGenres.find(g => g.id === id) || tvGenres.find(g => g.id === id)
      return g ? g.name : 'Unknown'
    },
    [movieGenres, tvGenres],
  )

  return {
    movieGenres,
    tvGenres,
    loading,
    getGenreName,
  }
}
