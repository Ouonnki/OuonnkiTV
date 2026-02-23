import { INITIAL_CONFIG } from './initialConfig'

const envSettings = INITIAL_CONFIG?.settings

export const DEFAULT_SETTINGS = {
  network: {
    defaultTimeout: envSettings?.network?.defaultTimeout ?? 3000,
    defaultRetry: envSettings?.network?.defaultRetry ?? 3,
    concurrencyLimit: envSettings?.network?.concurrencyLimit ?? 3,
    isProxyEnabled: envSettings?.network?.isProxyEnabled ?? true,
    proxyUrl: envSettings?.network?.proxyUrl ?? '/proxy?url=',
  },
  search: {
    isSearchHistoryEnabled: envSettings?.search?.isSearchHistoryEnabled ?? true,
    isSearchHistoryVisible: envSettings?.search?.isSearchHistoryVisible ?? true,
    maxSearchHistoryCount: envSettings?.search?.maxSearchHistoryCount ?? 20,
  },
  playback: {
    isViewingHistoryEnabled: envSettings?.playback?.isViewingHistoryEnabled ?? true,
    isViewingHistoryVisible: envSettings?.playback?.isViewingHistoryVisible ?? true,
    isAutoPlayEnabled: envSettings?.playback?.isAutoPlayEnabled ?? false,
    defaultEpisodeOrder: envSettings?.playback?.defaultEpisodeOrder ?? 'asc',
    defaultVolume: envSettings?.playback?.defaultVolume ?? 0.7,
    playerThemeColor: envSettings?.playback?.playerThemeColor ?? '#ef4444',
    maxViewingHistoryCount: envSettings?.playback?.maxViewingHistoryCount ?? 50,
    tmdbMatchCacheTTLHours: envSettings?.playback?.tmdbMatchCacheTTLHours ?? 24,
    isLoopEnabled: envSettings?.playback?.isLoopEnabled ?? false,
    isPipEnabled: envSettings?.playback?.isPipEnabled ?? true,
    isAutoMiniEnabled: envSettings?.playback?.isAutoMiniEnabled ?? true,
    isScreenshotEnabled: envSettings?.playback?.isScreenshotEnabled ?? true,
    isMobileGestureEnabled: envSettings?.playback?.isMobileGestureEnabled ?? true,
  },
  system: {
    tmdbEnabled: envSettings?.system?.tmdbEnabled ?? Boolean(import.meta.env.OKI_TMDB_API_TOKEN),
    tmdbApiToken: '',
    isUpdateLogEnabled: envSettings?.system?.isUpdateLogEnabled ?? false,
    tmdbLanguage: envSettings?.system?.tmdbLanguage ?? 'zh-CN',
    tmdbImageQuality: (envSettings?.system?.tmdbImageQuality ?? 'medium') as
      | 'low'
      | 'medium'
      | 'high',
  },
}
