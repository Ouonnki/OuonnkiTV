import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { DEFAULT_SETTINGS } from '@/shared/config/settings.config'
import {
  buildDefaultSettingsFieldUpdatedAt,
  type SettingsFieldUpdatedAt,
  updateSettingsFieldUpdatedAt,
} from '@/shared/lib/settingsSync'

export interface NetworkSettings {
  defaultTimeout: number
  defaultRetry: number
  concurrencyLimit: number
  isProxyEnabled: boolean
  proxyUrl: string
}

export interface SearchSettings {
  isSearchHistoryEnabled: boolean
  isSearchHistoryVisible: boolean
  maxSearchHistoryCount: number
}

export interface PlaybackSettings {
  isViewingHistoryEnabled: boolean
  isViewingHistoryVisible: boolean
  isAutoPlayEnabled: boolean
  defaultEpisodeOrder: 'asc' | 'desc'
  defaultVolume: number
  playerThemeColor: string
  maxViewingHistoryCount: number
  tmdbMatchCacheTTLHours: number
  isLoopEnabled: boolean
  isPipEnabled: boolean
  isAutoMiniEnabled: boolean
  isScreenshotEnabled: boolean
  isMobileGestureEnabled: boolean
  longPressPlaybackRate: number
  isFullscreenProgressHidden: boolean
}

export interface SystemSettings {
  tmdbEnabled: boolean
  tmdbApiToken: string
  tmdbApiBaseUrl: string
  tmdbImageBaseUrl: string
  isUpdateLogEnabled: boolean
  isScrollChromeAnimationEnabled: boolean
  tmdbLanguage: string
  tmdbImageQuality: 'low' | 'medium' | 'high'
}

export interface SettingsSyncMeta {
  fieldUpdatedAt: SettingsFieldUpdatedAt
}

export interface SettingState {
  network: NetworkSettings
  search: SearchSettings
  playback: PlaybackSettings
  system: SystemSettings
  syncMeta: SettingsSyncMeta
}

interface SettingActions {
  setNetworkSettings: (settings: Partial<NetworkSettings>) => void
  setSearchSettings: (settings: Partial<SearchSettings>) => void
  setPlaybackSettings: (settings: Partial<PlaybackSettings>) => void
  setSystemSettings: (settings: Partial<SystemSettings>) => void
  resetSettings: () => void
}

type SettingStore = SettingState & SettingActions

const buildDefaultSyncMeta = (): SettingsSyncMeta => ({
  fieldUpdatedAt: buildDefaultSettingsFieldUpdatedAt(),
})

const applySyncMetaMigration = (state: Record<string, unknown>, version: number): void => {
  if (version >= 14) return
  const syncMeta = (state.syncMeta ?? {}) as Partial<SettingsSyncMeta>
  state.syncMeta = {
    fieldUpdatedAt: {
      ...buildDefaultSettingsFieldUpdatedAt(),
      ...(syncMeta.fieldUpdatedAt ?? {}),
    },
  }
}

export const useSettingStore = create<SettingStore>()(
  devtools(
    persist(
      immer<SettingStore>(set => ({
        network: DEFAULT_SETTINGS.network,
        search: DEFAULT_SETTINGS.search,
        playback: DEFAULT_SETTINGS.playback,
        system: DEFAULT_SETTINGS.system,
        syncMeta: buildDefaultSyncMeta(),

        setNetworkSettings: settings => {
          set(state => {
            state.network = { ...state.network, ...settings }
            state.syncMeta.fieldUpdatedAt = updateSettingsFieldUpdatedAt(
              state.syncMeta.fieldUpdatedAt,
              'network',
              settings,
            )
          })
        },

        setSearchSettings: settings => {
          set(state => {
            state.search = { ...state.search, ...settings }
            state.syncMeta.fieldUpdatedAt = updateSettingsFieldUpdatedAt(
              state.syncMeta.fieldUpdatedAt,
              'search',
              settings,
            )
          })
        },

        setPlaybackSettings: settings => {
          set(state => {
            state.playback = { ...state.playback, ...settings }
            state.syncMeta.fieldUpdatedAt = updateSettingsFieldUpdatedAt(
              state.syncMeta.fieldUpdatedAt,
              'playback',
              settings,
            )
          })
        },

        setSystemSettings: settings => {
          set(state => {
            const merged = { ...state.system, ...settings }
            if ('tmdbApiToken' in settings && !settings.tmdbApiToken && !import.meta.env.OKI_TMDB_API_TOKEN) {
              merged.tmdbEnabled = false
            }
            state.system = merged
            state.syncMeta.fieldUpdatedAt = updateSettingsFieldUpdatedAt(
              state.syncMeta.fieldUpdatedAt,
              'system',
              settings,
            )
          })
        },

        resetSettings: () => {
          set(state => {
            state.network = DEFAULT_SETTINGS.network
            state.search = DEFAULT_SETTINGS.search
            state.playback = DEFAULT_SETTINGS.playback
            state.system = DEFAULT_SETTINGS.system
            state.syncMeta = buildDefaultSyncMeta()
          })
        },
      })),
      {
        name: 'ouonnki-tv-setting-store',
        version: 14,
        migrate: (persistedState: unknown, version: number) => {
          const state = persistedState as Record<string, unknown>

          if (version < 2 && state.playback) {
            delete (state.playback as Record<string, unknown>).adFilteringEnabled
          }
          if (version < 3) {
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
          if (version < 4) {
            const search = (state.search ?? {}) as Record<string, unknown>
            search.maxSearchHistoryCount ??= DEFAULT_SETTINGS.search.maxSearchHistoryCount
            state.search = search

            const playback = (state.playback ?? {}) as Record<string, unknown>
            playback.isLoopEnabled ??= DEFAULT_SETTINGS.playback.isLoopEnabled
            playback.isPipEnabled ??= DEFAULT_SETTINGS.playback.isPipEnabled
            playback.isAutoMiniEnabled ??= DEFAULT_SETTINGS.playback.isAutoMiniEnabled
            playback.isScreenshotEnabled ??= DEFAULT_SETTINGS.playback.isScreenshotEnabled
            state.playback = playback
          }
          if (version < 5) {
            const network = (state.network ?? {}) as Record<string, unknown>
            network.isProxyEnabled ??= DEFAULT_SETTINGS.network.isProxyEnabled
            network.proxyUrl ??= DEFAULT_SETTINGS.network.proxyUrl
            state.network = network
          }
          if (version < 6) {
            const playback = (state.playback ?? {}) as Record<string, unknown>
            playback.tmdbMatchCacheTTLHours ??= DEFAULT_SETTINGS.playback.tmdbMatchCacheTTLHours
            state.playback = playback
          }
          if (version < 7) {
            const playback = (state.playback ?? {}) as Record<string, unknown>
            playback.isMobileGestureEnabled ??= DEFAULT_SETTINGS.playback.isMobileGestureEnabled
            state.playback = playback
          }
          if (version < 8) {
            const system = (state.system ?? {}) as Record<string, unknown>
            system.tmdbEnabled ??= DEFAULT_SETTINGS.system.tmdbEnabled
            state.system = system
          }
          if (version < 9) {
            const system = (state.system ?? {}) as Record<string, unknown>
            system.tmdbApiToken ??= ''
            state.system = system
          }
          if (version < 10) {
            const system = (state.system ?? {}) as Record<string, unknown>
            system.tmdbApiBaseUrl ??= DEFAULT_SETTINGS.system.tmdbApiBaseUrl
            system.tmdbImageBaseUrl ??= DEFAULT_SETTINGS.system.tmdbImageBaseUrl
            state.system = system
          }
          if (version < 11) {
            const system = (state.system ?? {}) as Record<string, unknown>
            system.isScrollChromeAnimationEnabled ??= DEFAULT_SETTINGS.system.isScrollChromeAnimationEnabled
            state.system = system
          }
          if (version < 12) {
            const playback = (state.playback ?? {}) as Record<string, unknown>
            playback.longPressPlaybackRate ??= DEFAULT_SETTINGS.playback.longPressPlaybackRate
            state.playback = playback
          }
          if (version < 13) {
            const playback = (state.playback ?? {}) as Record<string, unknown>
            playback.isFullscreenProgressHidden ??= DEFAULT_SETTINGS.playback.isFullscreenProgressHidden
            state.playback = playback
          }

          applySyncMetaMigration(state, version)
          return state as unknown as SettingState
        },
      },
    ),
    {
      name: 'SettingStore',
    },
  ),
)
