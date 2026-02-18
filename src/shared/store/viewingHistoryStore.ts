import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { getHistoryItemKey, getHistorySeriesKey } from '@/shared/lib/viewingHistory'
import type { ViewingHistoryItem } from '@/shared/types'
import { useSettingStore } from './settingStore'

interface ViewingHistoryState {
  // 观看历史列表
  viewingHistory: ViewingHistoryItem[]
}

interface ViewingHistoryActions {
  // 添加观看历史
  addViewingHistory: (item: ViewingHistoryItem) => void
  // 删除同一视频的所有观看历史项
  removeViewingHistory: (item: ViewingHistoryItem) => void
  // 删除指定分集的观看历史项
  removeViewingHistoryItem: (item: ViewingHistoryItem) => void
  // 清空观看历史
  clearViewingHistory: () => void
}

type ViewingHistoryStore = ViewingHistoryState & ViewingHistoryActions

export const useViewingHistoryStore = create<ViewingHistoryStore>()(
  devtools(
    persist(
      immer<ViewingHistoryStore>(set => ({
        // 初始状态
        viewingHistory: [],

        // Actions
        addViewingHistory: (item: ViewingHistoryItem) => {
          // 检查是否开启了观看历史记录
          if (!useSettingStore.getState().playback.isViewingHistoryEnabled) {
            return
          }

          set(state => {
            if (item.duration <= 0) return
            // 检查是否已经存在相同视频的记录
            const targetItemKey = getHistoryItemKey(item)
            const existingIndex = state.viewingHistory.findIndex(
              historyItem => getHistoryItemKey(historyItem) === targetItemKey,
            )

            if (existingIndex !== -1) {
              // 更新现有记录
              const existingItem = { ...state.viewingHistory[existingIndex], ...item }
              // 移到最前面
              state.viewingHistory.splice(existingIndex, 1)
              state.viewingHistory.unshift(existingItem)
            } else {
              // 添加新记录
              state.viewingHistory.unshift({
                ...item,
                timestamp: Date.now(),
              })
            }

            // 限制历史记录数量
            const maxCount = useSettingStore.getState().playback.maxViewingHistoryCount
            if (state.viewingHistory.length > maxCount) {
              state.viewingHistory.splice(maxCount)
            }
          })
        },

        removeViewingHistory: (item: ViewingHistoryItem) => {
          set(state => {
            const targetSeriesKey = getHistorySeriesKey(item)
            state.viewingHistory = state.viewingHistory.filter(
              historyItem => getHistorySeriesKey(historyItem) !== targetSeriesKey,
            )
          })
        },

        removeViewingHistoryItem: (item: ViewingHistoryItem) => {
          set(state => {
            const targetItemKey = getHistoryItemKey(item)
            state.viewingHistory = state.viewingHistory.filter(
              historyItem => getHistoryItemKey(historyItem) !== targetItemKey,
            )
          })
        },

        clearViewingHistory: () => {
          set(state => {
            state.viewingHistory = []
          })
        },
      })),
      {
        name: 'ouonnki-tv-viewing-history', // 持久化存储的键名
        version: 3,
        migrate: (persistedState: unknown, version: number) => {
          const persistedHistory =
            (
              persistedState as
                | {
                    viewingHistory?: ViewingHistoryItem[]
                  }
                | undefined
            )?.viewingHistory || []

          if (version < 2) {
            return {
              viewingHistory: [], // 清空历史记录
            }
          }
          if (version < 2.1) {
            return {
              viewingHistory: persistedHistory.map(item => ({
                ...item,
                sourceName: item.sourceCode.slice(0, 5),
                recordType: 'cms',
              })),
            }
          }
          if (version < 3) {
            return {
              viewingHistory: persistedHistory.map(item => ({
                ...item,
                sourceName: item.sourceName || item.sourceCode.slice(0, 5),
                recordType: item.recordType === 'tmdb' ? 'tmdb' : 'cms',
              })),
            }
          }
          return persistedState
        },
      },
    ),
    {
      name: 'ViewingHistoryStore', // DevTools 中显示的名称
    },
  ),
)
