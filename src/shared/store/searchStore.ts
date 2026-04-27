import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { SearchHistory, SearchHistoryItem } from '@/shared/types'
import { buildSearchHistoryId, normalizeSearchContent } from '@/shared/lib'
import { useSettingStore } from './settingStore'

interface SearchState {
  query: string
  searchHistory: SearchHistory
}

interface SearchActions {
  setQuery: (query: string) => void
  clearQuery: () => void
  addSearchHistoryItem: (content: string) => void
  removeSearchHistoryItem: (id: string) => void
  clearSearchHistory: () => void
}

type SearchStore = SearchState & SearchActions

const migrateSearchHistory = (
  persistedState: Partial<SearchState> | undefined,
): Pick<SearchState, 'searchHistory'> => {
  const searchHistory = Array.isArray(persistedState?.searchHistory)
    ? persistedState.searchHistory.map(item => ({
        ...item,
        id: buildSearchHistoryId(item.content),
      }))
    : []

  return { searchHistory }
}

export const useSearchStore = create<SearchStore>()(
  devtools(
    persist(
      immer(set => ({
        query: '',
        searchHistory: [],

        setQuery: query => {
          set(state => {
            state.query = query
          })
        },

        clearQuery: () => {
          set(state => {
            state.query = ''
          })
        },

        addSearchHistoryItem: content => {
          const normalizedContent = normalizeSearchContent(content)
          if (!normalizedContent) return
          if (!useSettingStore.getState().search.isSearchHistoryEnabled) return

          set(state => {
            const existingItem = state.searchHistory.find(item => item.content === normalizedContent)

            if (existingItem) {
              existingItem.updatedAt = Date.now()
            } else {
              const newItem: SearchHistoryItem = {
                id: buildSearchHistoryId(normalizedContent),
                content: normalizedContent,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              }
              state.searchHistory.unshift(newItem)
            }

            state.searchHistory.sort((a, b) => b.updatedAt - a.updatedAt)

            const maxCount = useSettingStore.getState().search.maxSearchHistoryCount
            if (state.searchHistory.length > maxCount) {
              state.searchHistory.splice(maxCount)
            }
          })
        },

        removeSearchHistoryItem: id => {
          set(state => {
            state.searchHistory = state.searchHistory.filter(item => item.id !== id)
          })
        },

        clearSearchHistory: () => {
          set(state => {
            state.searchHistory = []
          })
        },
      })),
      {
        name: 'ouonnki-tv-search-store',
        version: 1,
        migrate: persistedState => migrateSearchHistory(persistedState as Partial<SearchState>),
        partialize: state => ({
          searchHistory: state.searchHistory,
        }),
      },
    ),
    {
      name: 'SearchStore',
    },
  ),
)
