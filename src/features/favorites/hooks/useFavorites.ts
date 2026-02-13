import { useFavoritesStore } from '../store/favoritesStore'
import type { FavoriteList, FavoriteStats } from '../types/favorites'
import { FavoriteWatchStatus } from '../types/favorites'
import type { TmdbMediaItem } from '@/shared/types/tmdb'
import type { VideoItem } from '@/shared/types/video'
import { useMemo } from 'react'

/**
 * 收藏功能 Hook (无头组件，仅提供状态和方法)
 */
export const useFavorites = () => {
  // 基础状态
  const favorites = useFavoritesStore(state => state.favorites)
  const filteredFavorites = useFavoritesStore(state => state.filteredFavorites)
  const filterOptions = useFavoritesStore(state => state.filterOptions)

  // 统计信息
  const stats = useMemo<FavoriteStats>(() => {
    const result: FavoriteStats = {
      total: favorites.length,
      tmdbCount: 0,
      cmsCount: 0,
      notWatchedCount: 0,
      watchingCount: 0,
      completedCount: 0,
    }
    favorites.forEach(f => {
      if (f.sourceType === 'tmdb') result.tmdbCount++
      else result.cmsCount++
      switch (f.watchStatus) {
        case FavoriteWatchStatus.NOT_WATCHED:
          result.notWatchedCount++
          break
        case FavoriteWatchStatus.WATCHING:
          result.watchingCount++
          break
        case FavoriteWatchStatus.COMPLETED:
          result.completedCount++
          break
      }
    })
    return result
  }, [favorites])

  // 所有标签 (去重排序)
  const allTags = useMemo<string[]>(() => {
    const tagSet = new Set<string>()
    favorites.forEach(f => {
      f.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [favorites])

  // 基础 CRUD 方法
  const addTmdbFavorite = useFavoritesStore(state => state.addTmdbFavorite)
  const addCmsFavorite = useFavoritesStore(state => state.addCmsFavorite)
  const addFavorites = useFavoritesStore(state => state.addFavorites)
  const removeFavorite = useFavoritesStore(state => state.removeFavorite)
  const removeFavorites = useFavoritesStore(state => state.removeFavorites)
  const clearFavorites = useFavoritesStore(state => state.clearFavorites)

  // 状态管理方法
  const updateWatchStatus = useFavoritesStore(state => state.updateWatchStatus)
  const updateWatchStatusBulk = useFavoritesStore(state => state.updateWatchStatusBulk)
  const setRating = useFavoritesStore(state => state.setRating)
  const setNotes = useFavoritesStore(state => state.setNotes)
  const addTag = useFavoritesStore(state => state.addTag)
  const removeTag = useFavoritesStore(state => state.removeTag)

  // 批量操作方法
  const selectAllFiltered = useFavoritesStore(state => state.selectAllFiltered)
  const deselectAll = useFavoritesStore(state => state.deselectAll)
  const setSelectedIds = useFavoritesStore(state => state.setSelectedIds)

  // 查询方法
  const isTmdbFavorited = useFavoritesStore(state => state.isTmdbFavorited)
  const isCmsFavorited = useFavoritesStore(state => state.isCmsFavorited)
  const getTmdbFavorite = useFavoritesStore(state => state.getTmdbFavorite)
  const getCmsFavorite = useFavoritesStore(state => state.getCmsFavorite)
  const toggleTmdbFavorite = useFavoritesStore(state => state.toggleTmdbFavorite)
  const toggleCmsFavorite = useFavoritesStore(state => state.toggleCmsFavorite)

  // 筛选方法
  const setFilter = useFavoritesStore(state => state.setFilter)
  const clearFilter = useFavoritesStore(state => state.clearFilter)

  /**
   * 检查是否已收藏 (统一接口)
   */
  const isFavorited = (item: TmdbMediaItem | VideoItem): boolean => {
    if ('mediaType' in item) {
      return isTmdbFavorited(item.id, item.mediaType)
    } else {
      return isCmsFavorited(item.vod_id, item.source_code || '')
    }
  }

  /**
   * 切换收藏状态 (统一接口)
   */
  const toggleFavorite = (item: TmdbMediaItem | VideoItem): void => {
    if ('mediaType' in item) {
      toggleTmdbFavorite(item)
    } else {
      toggleCmsFavorite(item)
    }
  }

  /**
   * 按状态分组收藏项
   */
  const groupByStatus = (): Record<FavoriteWatchStatus, FavoriteList> => {
    const notWatched: FavoriteList = []
    const watching: FavoriteList = []
    const completed: FavoriteList = []

    favorites.forEach(f => {
      switch (f.watchStatus) {
        case FavoriteWatchStatus.NOT_WATCHED:
          notWatched.push(f)
          break
        case FavoriteWatchStatus.WATCHING:
          watching.push(f)
          break
        case FavoriteWatchStatus.COMPLETED:
          completed.push(f)
          break
      }
    })

    return {
      [FavoriteWatchStatus.NOT_WATCHED]: notWatched,
      [FavoriteWatchStatus.WATCHING]: watching,
      [FavoriteWatchStatus.COMPLETED]: completed,
    }
  }

  /**
   * 按来源分组收藏项
   */
  const groupBySource = (): { tmdb: FavoriteList; cms: FavoriteList } => {
    const tmdb: FavoriteList = []
    const cms: FavoriteList = []

    favorites.forEach(f => {
      if (f.sourceType === 'tmdb') {
        tmdb.push(f)
      } else {
        cms.push(f)
      }
    })

    return { tmdb, cms }
  }

  return {
    // 状态
    favorites,
    filteredFavorites,
    filterOptions,
    stats,
    allTags,

    // 基础 CRUD
    addTmdbFavorite,
    addCmsFavorite,
    addFavorites,
    removeFavorite,
    removeFavorites,
    clearFavorites,

    // 状态管理
    updateWatchStatus,
    updateWatchStatusBulk,
    setRating,
    setNotes,
    addTag,
    removeTag,

    // 查询
    isTmdbFavorited,
    isCmsFavorited,
    isFavorited,
    getTmdbFavorite,
    getCmsFavorite,
    toggleTmdbFavorite,
    toggleCmsFavorite,
    toggleFavorite,

    // 筛选
    setFilter,
    clearFilter,

    // 批量操作
    selectAllFiltered,
    deselectAll,
    setSelectedIds,

    // 分组
    groupByStatus,
    groupBySource,
  }
}

/**
 * 简化版 Hook - 仅获取收藏状态和切换方法
 * 适用于组件中简单的收藏按钮
 */
export const useFavoriteToggle = () => {
  const isTmdbFavorited = useFavoritesStore(state => state.isTmdbFavorited)
  const isCmsFavorited = useFavoritesStore(state => state.isCmsFavorited)
  const toggleTmdbFavorite = useFavoritesStore(state => state.toggleTmdbFavorite)
  const toggleCmsFavorite = useFavoritesStore(state => state.toggleCmsFavorite)

  const isFavorited = (item: TmdbMediaItem | VideoItem): boolean => {
    if ('mediaType' in item) {
      return isTmdbFavorited(item.id, item.mediaType)
    } else {
      return isCmsFavorited(item.vod_id, item.source_code || '')
    }
  }

  const toggleFavorite = (item: TmdbMediaItem | VideoItem): void => {
    if ('mediaType' in item) {
      toggleTmdbFavorite(item)
    } else {
      toggleCmsFavorite(item)
    }
  }

  return {
    isFavorited,
    toggleFavorite,
  }
}
