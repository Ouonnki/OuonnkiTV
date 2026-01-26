import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { SearchHistory, SearchHistoryItem, VideoItem } from '@/shared/types'
import { v4 as uuidv4 } from 'uuid'

// 搜索结果缓存最大数量
// 搜索结果缓存最大数量
const MAX_CACHE_SIZE = 10
// 缓存过期时间 (默认值, 实际使用 SettingStore 中的配置)
const DEFAULT_CACHE_EXPIRY_HOURS = 24

// 缓存项接口
interface SearchCacheItem {
  results: VideoItem[] // 搜索结果
  timestamp: number // 缓存时间戳
}

interface SearchState {
  // 当前搜索查询
  query: string
  // 搜索历史记录
  searchHistory: SearchHistory
  // 搜索结果缓存 (Key: sourceId:query:page) -> Cache Item
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
  // 删除搜索结果缓存 (按 Query 删除所有相关缓存)
  removeSearchResultsCacheItem: (query: string) => void
  // 获取缓存的搜索结果 (按 Key 获取)
  getCachedResultByKey: (sourceId: string, query: string, page: number) => VideoItem[] | undefined
  // 设置搜索结果缓存 (单源缓存)
  updateCacheForSource: (sourceId: string, query: string, page: number, results: VideoItem[]) => void
  // 清空搜索结果缓存
  clearSearchResultsCache: () => void
  // 清理过期的缓存
  cleanExpiredCache: () => void
  // Legacy methods (kept to avoid breakage during refactor, but made no-op or adapted)
  getCachedResults: (query: string) => void
  updateCachedResults: (query: string, newResults: VideoItem[], completedApiIds: string[], isComplete: boolean) => void
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
             // Delete all keys that contain this query
             const keysToDelete = Object.keys(state.searchResultsCache).filter(k => k.includes(`:${query}:`))
             keysToDelete.forEach(k => delete state.searchResultsCache[k])
          })
        },

        getCachedResults: (query: string) => {
           // This legacy method signature doesn't match new structure well
           // But since useDirectSearch will be updated to read specific keys, 
           // we can temporarily stub it or return undefined to force fresh fetch until hook is updated
           // Or better: We expose a new selector in the store or just direct state access
           // For now, let's keep it but make it do nothing or return undefined as we are changing the consumer
           return undefined
        },
        
        // New helper to get result by specific key
        getCachedResultByKey: (sourceId: string, query: string, page: number) => {
             const key = `${sourceId}:${query}:${page}`
             const cached = get().searchResultsCache[key]
             if (!cached) return undefined
             
             const now = Date.now()
             const expiryHours = useSettingStore.getState().search.searchCacheExpiryHours ?? DEFAULT_CACHE_EXPIRY_HOURS
             const expiryTime = expiryHours * 60 * 60 * 1000
             
             if (now - cached.timestamp > expiryTime) {
                 // Lazy delete
                 set((state) => { delete state.searchResultsCache[key] })
                 return undefined
             }
             return cached.results
        },

        updateCachedResults: (
          query: string,
          newResults: VideoItem[],
          completedApiIds: string[], // Legacy param, ignored
          isComplete: boolean, // Legacy param, ignored
        ) => {
             // This overload is legacy. We need a new signature.
             // But since we are modifying the store definition, let's change the signature directly.
             // Note: MultiReplace might be safer if we are changing type definitions elsewhere.
             // Let's implement the NEW logic here assuming the caller adapts.
             // Actually, the plan is to update useDirectSearch.
        },
        
        // Correct implementation for new structure
        updateCacheForSource: (sourceId: string, query: string, page: number, results: VideoItem[]) => {
            set(state => {
                 const key = `${sourceId}:${query}:${page}`
                 
                 // LRU check
                 const cacheKeys = Object.keys(state.searchResultsCache)
                 if (cacheKeys.length >= MAX_CACHE_SIZE * 5) { // Increase multiplier because keys are granular now using *5 
                    // Simple removal of oldest
                    let oldestKey = cacheKeys[0]
                    let oldestTime = state.searchResultsCache[oldestKey]?.timestamp || Date.now()
                    
                    for (const k of cacheKeys) {
                        if (state.searchResultsCache[k].timestamp < oldestTime) {
                            oldestTime = state.searchResultsCache[k].timestamp
                            oldestKey = k
                        }
                    }
                    delete state.searchResultsCache[oldestKey]
                 }

                 state.searchResultsCache[key] = {
                     results,
                     timestamp: Date.now()
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
