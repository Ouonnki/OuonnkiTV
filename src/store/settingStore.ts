import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface NetworkSettings {
  defaultTimeout: number
  defaultRetry: number
}

interface SearchSettings {
  isSearchHistoryEnabled: boolean
  isSearchHistoryVisible: boolean
  searchCacheExpiryHours: number
}

interface PlaybackSettings {
  isViewingHistoryEnabled: boolean
  isViewingHistoryVisible: boolean
  isAutoPlayEnabled: boolean
  defaultEpisodeOrder: 'asc' | 'desc'
  adFilteringEnabled: boolean
}

interface SystemSettings {
  isUpdateLogEnabled: boolean
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
}

type SettingStore = SettingState & SettingActions

export const useSettingStore = create<SettingStore>()(
  devtools(
    persist(
      immer<SettingStore>(set => ({
        network: {
          defaultTimeout: 3000,
          defaultRetry: 3,
        },
        search: {
          isSearchHistoryEnabled: true,
          isSearchHistoryVisible: true,
          searchCacheExpiryHours: 24,
        },
        playback: {
          isViewingHistoryEnabled: true,
          isViewingHistoryVisible: true,
          isAutoPlayEnabled: false,
          defaultEpisodeOrder: 'asc',
          adFilteringEnabled: true,
        },
        system: {
          isUpdateLogEnabled: true,
        },

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
      })),
      {
        name: 'ouonnki-tv-setting-store',
        version: 1,
      },
    ),
    {
      name: 'SettingStore',
    },
  ),
)
