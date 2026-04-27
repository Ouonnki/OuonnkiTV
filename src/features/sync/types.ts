import type { FavoriteItem } from '@/features/favorites/types/favorites'
import type { ThemeState } from '@/shared/components/theme'
import type {
  NetworkSettings,
  PlaybackSettings,
  SearchSettings,
  SystemSettings,
} from '@/shared/store/settingStore'
import type { SearchHistory, ViewingHistoryItem } from '@/shared/types'

export type SyncFieldMeta = Record<string, number>

export interface SyncThemePayload {
  mode: ThemeState['mode']
  updatedAt: number
}

export interface SyncSettingsPayload {
  network: NetworkSettings
  search: SearchSettings
  playback: PlaybackSettings
  system: Omit<SystemSettings, 'tmdbApiToken'>
  fieldUpdatedAt: SyncFieldMeta
}

export interface SyncAdFilteringPayload {
  value: boolean
  updatedAt: number
}

export interface SyncVideoSourceRecord {
  id: string
  name: string
  url: string
  detailUrl?: string
  timeout?: number
  retry?: number
  isEnabled: boolean
  syncOrigin: 'manual'
  sortIndex: number
  updatedAt: string
}

export interface SyncSubscriptionRecord {
  id: string
  name: string
  url: string
  refreshInterval: number
  createdAt: string
  updatedAt: string
}

export interface SyncSnapshot {
  favorites: FavoriteItem[]
  viewingHistory: ViewingHistoryItem[]
  searchHistory: SearchHistory
  theme: SyncThemePayload
  settings: SyncSettingsPayload
  adFilteringEnabled: SyncAdFilteringPayload
  videoSources: SyncVideoSourceRecord[]
  subscriptions: SyncSubscriptionRecord[]
}

export interface SyncStatePayload {
  snapshot: SyncSnapshot
  revision: number
  updatedAt: string | null
  hasState: boolean
}

export interface SyncStateResponse extends SyncStatePayload {
  merged: boolean
}

export interface SyncStateUpdateRequest {
  revision: number
  snapshot: SyncSnapshot
}

export interface AuthSessionPayload {
  user: {
    id: string
    username: string
  }
  issuedAt: string
  expiresAt: string
}
