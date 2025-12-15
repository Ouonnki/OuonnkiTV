import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { SearchHistory, SearchHistoryItem, VideoItem } from '@/types'
import { v4 as uuidv4 } from 'uuid'

// 搜索结果缓存最大数量
// 搜索结果缓存最大数量
const MAX_CACHE_SIZE = 10
// 缓存过期时间 (默认值, 实际使用 SettingStore 中的配置)
const DEFAULT_CACHE_EXPIRY_HOURS = 24

// 缓存项接口
interface SearchCacheItem {
  results: VideoItem[] // 搜索结果
  completedApiIds: string[] // 已完成搜索的 API ID 列表
  isComplete: boolean // 是否已完成所有 API 的搜索
  timestamp: number // 缓存时间戳
  videoSourcesSnapshot?: string // 视频源状态快照 (id + isEnabled)
}

interface SearchState {
  // 当前搜索查询
  query: string
  // 搜索历史记录
  searchHistory: SearchHistory
  // 搜索结果缓存 (query -> cache item)
  searchResultsCache: Record<string, SearchCacheItem>
}

interface SearchActions {
  // 设置搜索查询
  setQuery: (query: string) => void
  // 清空搜索查询
  clearQuery: () => void
  // 添加搜索历史项
  addSearchHistoryItem: (content: string) => void
  // 删除搜索历史项
  removeSearchHistoryItem: (id: string) => void
  // 清空搜索历史
  clearSearchHistory: () => void
  // 删除单个搜索结果缓存
  removeSearchResultsCacheItem: (query: string) => void
  // 获取缓存的搜索结果
  getCachedResults: (query: string) => SearchCacheItem | undefined
  // 设置搜索结果缓存(增量更新)
  updateCachedResults: (
    query: string,
    newResults: VideoItem[],
    completedApiIds: string[],
    isComplete: boolean,
  ) => void
  // 清空搜索结果缓存
  clearSearchResultsCache: () => void
  // 清理过期的缓存
  cleanExpiredCache: () => void
}

type SearchStore = SearchState & SearchActions

import { useSettingStore } from './settingStore'
import { useApiStore } from './apiStore'

export const useSearchStore = create<SearchStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // 初始状态
        query: '',
        searchHistory: [],
        searchResultsCache: {},

        // Actions
        setQuery: (query: string) => {
          set(state => {
            state.query = query
          })
        },

        clearQuery: () => {
          set(state => {
            state.query = ''
          })
        },

        addSearchHistoryItem: (content: string) => {
          // 检查是否开启了搜索历史记录
          if (!useSettingStore.getState().search.isSearchHistoryEnabled) {
            return
          }

          set(state => {
            const existingItem = state.searchHistory.find(
              (item: SearchHistoryItem) => item.content === content,
            )

            if (existingItem) {
              // 更新现有项的时间戳
              existingItem.updatedAt = Date.now()
            } else {
              // 添加新项到历史记录开头
              const newItem: SearchHistoryItem = {
                id: uuidv4(),
                content,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              }
              state.searchHistory.unshift(newItem)
            }

            // 按更新时间排序
            state.searchHistory.sort(
              (a: SearchHistoryItem, b: SearchHistoryItem) => b.updatedAt - a.updatedAt,
            )
          })
        },

        removeSearchHistoryItem: (id: string) => {
          set(state => {
            state.searchHistory = state.searchHistory.filter(
              (item: SearchHistoryItem) => item.id !== id,
            )
          })
        },

        clearSearchHistory: () => {
          set(state => {
            state.searchHistory = []
          })
        },

        removeSearchResultsCacheItem: (query: string) => {
          set(state => {
            delete state.searchResultsCache[query]
          })
        },

        getCachedResults: (query: string) => {
          const cached = get().searchResultsCache[query]

          // 检查缓存是否存在
          if (!cached) {
            return undefined
          }

          // 检查缓存是否过期
          const now = Date.now()
          const expiryHours =
            useSettingStore.getState().search.searchCacheExpiryHours ?? DEFAULT_CACHE_EXPIRY_HOURS
          const expiryTime = expiryHours * 60 * 60 * 1000
          // 如果 expiryHours 为 0, 视为永不过期 (或者立即过期? 用户通常设0意为不缓存)
          // 但根据 request "缓存过期时间设置为0的时候应该为0", 意味着立即过期。
          // 之前的逻辑: if searchCacheExpiryHours is 0, || DEFAULT takes over (which is 24).
          // Now ?? takes over only if undefined/null. So if 0, expiryTime is 0.
          const isExpired = now - cached.timestamp > expiryTime

          if (isExpired) {
            console.log(`缓存已过期: ${query}`)
            // 删除过期缓存
            set(state => {
              delete state.searchResultsCache[query]
            })
            return undefined
          }

          // 检查视频源状态是否发生变化 (包括源本身的变化和启用状态的变化)
          const currentSources = useApiStore.getState().videoAPIs
          const currentSnapshot = JSON.stringify(
            currentSources
              .map(s => ({ id: s.id, isEnabled: s.isEnabled, url: s.url }))
              .sort((a, b) => a.id.localeCompare(b.id)),
          )

          if (cached.videoSourcesSnapshot && cached.videoSourcesSnapshot !== currentSnapshot) {
            console.log(`视频源状态已变更, 缓存废弃: ${query}`)
            // 删除无效缓存
            set(state => {
              delete state.searchResultsCache[query]
            })
            return undefined
          }

          return cached
        },

        updateCachedResults: (
          query: string,
          newResults: VideoItem[],
          completedApiIds: string[],
          isComplete: boolean,
        ) => {
          set(state => {
            const existing = state.searchResultsCache[query]

            // 生成当前视频源快照
            const currentSources = useApiStore.getState().videoAPIs
            const videoSourcesSnapshot = JSON.stringify(
              currentSources
                .map(s => ({ id: s.id, isEnabled: s.isEnabled, url: s.url }))
                .sort((a, b) => a.id.localeCompare(b.id)),
            )

            if (existing) {
              // 合并结果,去重
              const mergedResults = [...existing.results, ...newResults]
              const seen = new Set<string>()
              const uniqueResults = mergedResults.filter(item => {
                const key = `${item.source_code}_${item.vod_id}`
                if (!seen.has(key)) {
                  seen.add(key)
                  return true
                }
                return false
              })

              // 合并已完成的 API ID
              const mergedApiIds = Array.from(
                new Set([...existing.completedApiIds, ...completedApiIds]),
              )

              state.searchResultsCache[query] = {
                results: uniqueResults,
                completedApiIds: mergedApiIds,
                isComplete: isComplete || existing.isComplete,
                timestamp: Date.now(),
                videoSourcesSnapshot: existing.videoSourcesSnapshot || videoSourcesSnapshot,
              }
            } else {
              // 新建缓存项
              // 如果缓存数量超过限制,删除最旧的缓存
              const cacheKeys = Object.keys(state.searchResultsCache)
              if (cacheKeys.length >= MAX_CACHE_SIZE) {
                // 找到最旧的缓存
                let oldestKey = cacheKeys[0]
                let oldestTime = state.searchResultsCache[oldestKey]?.timestamp || Date.now()

                cacheKeys.forEach(key => {
                  const timestamp = state.searchResultsCache[key]?.timestamp || Date.now()
                  if (timestamp < oldestTime) {
                    oldestTime = timestamp
                    oldestKey = key
                  }
                })

                if (oldestKey) {
                  delete state.searchResultsCache[oldestKey]
                }
              }

              state.searchResultsCache[query] = {
                results: newResults,
                completedApiIds,
                isComplete,
                timestamp: Date.now(),
                videoSourcesSnapshot,
              }
            }
          })
        },

        clearSearchResultsCache: () => {
          set(state => {
            state.searchResultsCache = {}
          })
        },

        cleanExpiredCache: () => {
          set(state => {
            const now = Date.now()
            const cacheKeys = Object.keys(state.searchResultsCache)
            let removedCount = 0

            cacheKeys.forEach(key => {
              const cached = state.searchResultsCache[key]
              const expiryHours =
                useSettingStore.getState().search.searchCacheExpiryHours ??
                DEFAULT_CACHE_EXPIRY_HOURS
              const expiryTime = expiryHours * 60 * 60 * 1000

              if (cached && now - cached.timestamp > expiryTime) {
                delete state.searchResultsCache[key]
                removedCount++
              }
            })

            if (removedCount > 0) {
              console.log(`清理了 ${removedCount} 个过期缓存`)
            }
          })
        },
      })),
      {
        name: 'ouonnki-tv-search-store', // 持久化存储的键名
        partialize: state => ({
          // 持久化搜索历史和搜索结果缓存
          searchHistory: state.searchHistory,
          searchResultsCache: state.searchResultsCache,
        }),
      },
    ),
    {
      name: 'SearchStore', // DevTools 中显示的名称
    },
  ),
)
