import { INITIAL_CONFIG } from './initialConfig'

const envSettings = INITIAL_CONFIG?.settings

export const DEFAULT_SETTINGS = {
  network: {
    defaultTimeout:
      envSettings?.network?.defaultTimeout ??
      (Number(import.meta.env.OKI_DEFAULT_TIMEOUT) || 3000),
    defaultRetry:
      envSettings?.network?.defaultRetry ?? (Number(import.meta.env.OKI_DEFAULT_RETRY) || 3),
    concurrencyLimit:
      envSettings?.network?.concurrencyLimit ??
      (Number(import.meta.env.OKI_CONCURRENCY_LIMIT) || 3),
    isProxyEnabled:
      envSettings?.network?.isProxyEnabled ?? import.meta.env.OKI_PROXY_ENABLED !== 'false',
    proxyUrl: envSettings?.network?.proxyUrl ?? (import.meta.env.OKI_PROXY_URL || '/proxy?url='),
  },
  search: {
    isSearchHistoryEnabled:
      envSettings?.search?.isSearchHistoryEnabled ??
      import.meta.env.OKI_SEARCH_HISTORY_ENABLED !== 'false',
    isSearchHistoryVisible: envSettings?.search?.isSearchHistoryVisible ?? true,
    maxSearchHistoryCount:
      envSettings?.search?.maxSearchHistoryCount ??
      (Number(import.meta.env.OKI_MAX_SEARCH_HISTORY_COUNT) || 20),
  },
  playback: {
    isViewingHistoryEnabled:
      envSettings?.playback?.isViewingHistoryEnabled ??
      import.meta.env.OKI_VIEWING_HISTORY_ENABLED !== 'false',
    isViewingHistoryVisible: envSettings?.playback?.isViewingHistoryVisible ?? true,
    isAutoPlayEnabled:
      envSettings?.playback?.isAutoPlayEnabled ?? import.meta.env.OKI_AUTOPLAY_ENABLED === 'true',
    defaultEpisodeOrder:
      envSettings?.playback?.defaultEpisodeOrder ??
      ((import.meta.env.OKI_DEFAULT_EPISODE_ORDER as 'asc' | 'desc') || 'asc'),
    defaultVolume:
      envSettings?.playback?.defaultVolume ??
      (Number(import.meta.env.OKI_DEFAULT_VOLUME) || 0.7),
    playerThemeColor:
      envSettings?.playback?.playerThemeColor ??
      (import.meta.env.OKI_PLAYER_THEME_COLOR || '#ef4444'),
    maxViewingHistoryCount:
      envSettings?.playback?.maxViewingHistoryCount ??
      (Number(import.meta.env.OKI_MAX_VIEWING_HISTORY_COUNT) || 50),
    tmdbMatchCacheTTLHours:
      envSettings?.playback?.tmdbMatchCacheTTLHours ??
      (Number(import.meta.env.OKI_TMDB_MATCH_CACHE_TTL_HOURS) || 24),
    isLoopEnabled: envSettings?.playback?.isLoopEnabled ?? false,
    isPipEnabled: envSettings?.playback?.isPipEnabled ?? true,
    isAutoMiniEnabled: envSettings?.playback?.isAutoMiniEnabled ?? true,
    isScreenshotEnabled: envSettings?.playback?.isScreenshotEnabled ?? true,
    isMobileGestureEnabled: envSettings?.playback?.isMobileGestureEnabled ?? true,
  },
  system: {
    isUpdateLogEnabled:
      envSettings?.system?.isUpdateLogEnabled ?? import.meta.env.OKI_UPDATE_LOG_ENABLED === 'true',
    tmdbLanguage:
      envSettings?.system?.tmdbLanguage ??
      (import.meta.env.OKI_TMDB_LANGUAGE || 'zh-CN'),
    tmdbImageQuality:
      (envSettings?.system?.tmdbImageQuality ??
      (import.meta.env.OKI_TMDB_IMAGE_QUALITY || 'medium')) as 'low' | 'medium' | 'high',
  },
}
