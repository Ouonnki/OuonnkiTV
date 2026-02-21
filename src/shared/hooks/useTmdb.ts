import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AppendToResponseMovieKey, AppendToResponseTvKey } from 'tmdb-ts'
import { useTmdbStore } from '../store/tmdbStore'
import { getTmdbClient, normalizeToMediaItem } from '../lib/tmdb'
import { useSettingStore } from '../store/settingStore'
import type { TmdbMediaType, TmdbMovieDetail, TmdbTvDetail } from '../types/tmdb'

interface RecommendationSource {
  id: number
  mediaType: TmdbMediaType
}

const EMPTY_RECOMMENDATION_SOURCES: RecommendationSource[] = []

const buildRecommendationSourceKey = (source: RecommendationSource) => `${source.mediaType}:${source.id}`

export function selectRecommendationSource(
  previous: RecommendationSource | null,
  candidates: RecommendationSource[],
  randomFn: () => number = Math.random,
): RecommendationSource | null {
  if (candidates.length === 0) return null

  if (previous) {
    const previousKey = buildRecommendationSourceKey(previous)
    const exists = candidates.some(candidate => buildRecommendationSourceKey(candidate) === previousKey)
    if (exists) return previous
  }

  const randomIndex = Math.floor(randomFn() * candidates.length)
  const safeIndex = Math.max(0, Math.min(candidates.length - 1, randomIndex))
  return candidates[safeIndex]
}

export function findNextRecommendationSource(
  candidates: RecommendationSource[],
  attemptedSourceKeys: Set<string>,
): RecommendationSource | null {
  const next = candidates.find(candidate => !attemptedSourceKeys.has(buildRecommendationSourceKey(candidate)))
  return next || null
}

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
 * 发现/浏览功能 Hook（无搜索词时使用）
 */
export function useTmdbDiscover() {
  const results = useTmdbStore(s => s.discoverResults)
  const pagination = useTmdbStore(s => s.discoverPagination)
  const loading = useTmdbStore(s => s.loading.discover)
  const filterOptions = useTmdbStore(s => s.filterOptions)

  const fetchDiscover = useTmdbStore(s => s.fetchDiscover)
  const setFilter = useTmdbStore(s => s.setFilter)
  const clearFilter = useTmdbStore(s => s.clearFilter)

  return {
    results,
    pagination,
    loading,
    filterOptions,
    fetchDiscover,
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
 * 猜你喜欢 Hook
 * 优先从传入的 TMDB 候选来源中随机选择一条；若没有候选来源则回退到 trending。
 * 为避免重渲染时随机抖动，候选集合不变时会优先复用上一次已选中的来源。
 */
export function useTmdbRecommendations(
  preferredSources: RecommendationSource[] = EMPTY_RECOMMENDATION_SOURCES,
) {
  const recommendations = useTmdbStore(s => s.recommendations)
  const loading = useTmdbStore(s => s.loading.recommendations)
  const trending = useTmdbStore(s => s.trending)

  const fetchRecommendations = useTmdbStore(s => s.fetchRecommendations)
  const attemptedSourceKeysRef = useRef<Set<string>>(new Set())
  const [selectedSource, setSelectedSource] = useState<RecommendationSource | null>(null)

  const sourceCandidates = useMemo<RecommendationSource[]>(() => {
    const sourceMap = new Map<string, RecommendationSource>()

    if (preferredSources.length > 0) {
      preferredSources.forEach(source => {
        sourceMap.set(buildRecommendationSourceKey(source), source)
      })
      return Array.from(sourceMap.values())
    }

    trending.forEach(item => {
      sourceMap.set(buildRecommendationSourceKey({ id: item.id, mediaType: item.mediaType }), {
        id: item.id,
        mediaType: item.mediaType,
      })
    })
    return Array.from(sourceMap.values())
  }, [preferredSources, trending])

  useEffect(() => {
    attemptedSourceKeysRef.current = new Set()
    setSelectedSource(previous => selectRecommendationSource(previous, sourceCandidates))
  }, [sourceCandidates])

  useEffect(() => {
    if (!selectedSource) return

    const sourceKey = buildRecommendationSourceKey(selectedSource)
    if (attemptedSourceKeysRef.current.has(sourceKey)) {
      return
    }

    const currentState = useTmdbStore.getState()
    const sourceUnchangedAndHasData =
      currentState.recommendationSourceId === selectedSource.id &&
      currentState.recommendationSourceMediaType === selectedSource.mediaType &&
      currentState.recommendations.length > 0
    if (sourceUnchangedAndHasData) {
      attemptedSourceKeysRef.current.add(sourceKey)
      return
    }

    attemptedSourceKeysRef.current.add(sourceKey)
    let cancelled = false

    const fetchBySource = async () => {
      try {
        await fetchRecommendations(selectedSource.id, selectedSource.mediaType)
      } catch {
        // fetchRecommendations 已在 store 内处理错误状态，这里仅做降级切源。
      }

      if (cancelled) return

      const latestState = useTmdbStore.getState()
      const hasDataFromSelectedSource =
        latestState.recommendationSourceId === selectedSource.id &&
        latestState.recommendationSourceMediaType === selectedSource.mediaType &&
        latestState.recommendations.length > 0
      if (hasDataFromSelectedSource) {
        return
      }

      const nextSource = findNextRecommendationSource(sourceCandidates, attemptedSourceKeysRef.current)
      if (nextSource) {
        setSelectedSource(nextSource)
      }
    }

    void fetchBySource()

    return () => {
      cancelled = true
    }
  }, [
    selectedSource,
    fetchRecommendations,
    sourceCandidates,
  ])

  return {
    recommendations,
    loading,
    refreshRecommendations: fetchRecommendations,
  }
}

/**
 * 详情 Hook (独立状态，不存入 Global Store)
 */
export function useTmdbDetail<T extends TmdbMovieDetail | TmdbTvDetail>(
  id: number | undefined,
  mediaType: TmdbMediaType,
  language = useSettingStore.getState().system.tmdbLanguage,
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
      const movieAppendToResponse: AppendToResponseMovieKey[] = [
        'credits',
        'images',
        'videos',
        'reviews',
        'recommendations',
        'keywords',
        'release_dates',
        'external_ids',
        'translations',
        'watch/providers',
        'similar',
      ]
      const tvAppendToResponse: AppendToResponseTvKey[] = [
        'credits',
        'aggregate_credits',
        'images',
        'videos',
        'reviews',
        'recommendations',
        'keywords',
        'content_ratings',
        'episode_groups',
        'external_ids',
        'translations',
        'watch/providers',
        'similar',
      ]

      if (mediaType === 'movie') {
        data = await client.movies.details(id, movieAppendToResponse, language)
      } else {
        data = await client.tvShows.details(id, tvAppendToResponse, language)
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
