import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { DEFAULT_SETTINGS } from '@/shared/config/settings.config'

interface NetworkSettings {
  defaultTimeout: number
  defaultRetry: number
  concurrencyLimit: number
}

interface SearchSettings {
  isSearchHistoryEnabled: boolean
  isSearchHistoryVisible: boolean
}

interface PlaybackSettings {
  isViewingHistoryEnabled: boolean
  isViewingHistoryVisible: boolean
  isAutoPlayEnabled: boolean
  defaultEpisodeOrder: 'asc' | 'desc'
  defaultVolume: number
  playerThemeColor: string
  maxViewingHistoryCount: number
}

interface SystemSettings {
  isUpdateLogEnabled: boolean
  tmdbLanguage: string
  tmdbImageQuality: 'low' | 'medium' | 'high'
}

interface SettingState {
  network: NetworkSettings
  search: SearchSettings
  playback: PlaybackSettings
  system: SystemSettings
}

interface SettingActions {
  // Network
  setNetworkSettings: (settings: Partial<NetworkSettings>) => void

  // Search
  setSearchSettings: (settings: Partial<SearchSettings>) => void

  // Playback
  setPlaybackSettings: (settings: Partial<PlaybackSettings>) => void

  // System
  setSystemSettings: (settings: Partial<SystemSettings>) => void

  // Reset
  resetSettings: () => void
}

type SettingStore = SettingState & SettingActions

export const useSettingStore = create<SettingStore>()(
  devtools(
    persist(
      immer<SettingStore>(set => ({
        network: DEFAULT_SETTINGS.network,
        search: DEFAULT_SETTINGS.search,
        playback: DEFAULT_SETTINGS.playback,
        system: DEFAULT_SETTINGS.system,

        setNetworkSettings: settings => {
          set(state => {
            state.network = { ...state.network, ...settings }
          })
        },

        setSearchSettings: settings => {
          set(state => {
            state.search = { ...state.search, ...settings }
          })
        },

        setPlaybackSettings: settings => {
          set(state => {
            state.playback = { ...state.playback, ...settings }
          })
        },

        setSystemSettings: settings => {
          set(state => {
            state.system = { ...state.system, ...settings }
          })
        },

        resetSettings: () => {
          set(state => {
            state.network = DEFAULT_SETTINGS.network
            state.search = DEFAULT_SETTINGS.search
            state.playback = DEFAULT_SETTINGS.playback
            state.system = DEFAULT_SETTINGS.system
          })
        },
      })),
      {
        name: 'ouonnki-tv-setting-store',
        version: 3,
        migrate: (persistedState: unknown, version: number) => {
          const state = persistedState as Record<string, unknown>
          if (version < 2 && state.playback) {
            // v1→v2: 移除已废弃的 adFilteringEnabled 字段，统一使用 apiStore
            delete (state.playback as Record<string, unknown>).adFilteringEnabled
          }
          if (version < 3) {
            // v2→v3: 为新增字段补充默认值
            const playback = (state.playback ?? {}) as Record<string, unknown>
            playback.defaultVolume ??= DEFAULT_SETTINGS.playback.defaultVolume
            playback.playerThemeColor ??= DEFAULT_SETTINGS.playback.playerThemeColor
            playback.maxViewingHistoryCount ??= DEFAULT_SETTINGS.playback.maxViewingHistoryCount
            state.playback = playback

            const network = (state.network ?? {}) as Record<string, unknown>
            network.concurrencyLimit ??= DEFAULT_SETTINGS.network.concurrencyLimit
            state.network = network

            const system = (state.system ?? {}) as Record<string, unknown>
            system.tmdbLanguage ??= DEFAULT_SETTINGS.system.tmdbLanguage
            system.tmdbImageQuality ??= DEFAULT_SETTINGS.system.tmdbImageQuality
            state.system = system
          }
          return state
        },
      },
    ),
    {
      name: 'SettingStore',
    },
  ),
)
