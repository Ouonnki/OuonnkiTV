import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { SearchHistory, SearchHistoryItem } from '@/shared/types'
import { v4 as uuidv4 } from 'uuid'

import { useSettingStore } from './settingStore'

const normalizeSearchContent = (content: string) => content.trim().replace(/\s+/g, ' ')

interface SearchState {
  // 当前搜索查询
  query: string
  // 搜索历史记录
  searchHistory: SearchHistory
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
}

type SearchStore = SearchState & SearchActions

export const useSearchStore = create<SearchStore>()(
  devtools(
    persist(
      immer(set => ({
        // 初始状态
        query: '',
        searchHistory: [],

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
          const normalizedContent = normalizeSearchContent(content)
          if (!normalizedContent) return

          // 检查是否开启了搜索历史记录
          if (!useSettingStore.getState().search.isSearchHistoryEnabled) {
            return
          }

          set(state => {
            const existingItem = state.searchHistory.find(
              (item: SearchHistoryItem) => item.content === normalizedContent,
            )

            if (existingItem) {
              // 更新现有项的时间戳
              existingItem.updatedAt = Date.now()
            } else {
              // 添加新项到历史记录开头
              const newItem: SearchHistoryItem = {
                id: uuidv4(),
                content: normalizedContent,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              }
              state.searchHistory.unshift(newItem)
            }

            // 按更新时间排序
            state.searchHistory.sort(
              (a: SearchHistoryItem, b: SearchHistoryItem) => b.updatedAt - a.updatedAt,
            )

            // 限制历史记录数量
            const maxCount = useSettingStore.getState().search.maxSearchHistoryCount
            if (state.searchHistory.length > maxCount) {
              state.searchHistory.splice(maxCount)
            }
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
      })),
      {
        name: 'ouonnki-tv-search-store', // 持久化存储的键名
        partialize: state => ({
          // 持久化搜索历史
          searchHistory: state.searchHistory,
        }),
      },
    ),
    {
      name: 'SearchStore', // DevTools 中显示的名称
    },
  ),
)
