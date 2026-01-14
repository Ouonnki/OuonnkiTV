import { INITIAL_CONFIG } from './initialConfig'

const envSettings = INITIAL_CONFIG?.settings

export const DEFAULT_SETTINGS = {
  network: {
    defaultTimeout:
      envSettings?.network?.defaultTimeout ??
      (Number(import.meta.env.VITE_DEFAULT_TIMEOUT) || 3000),
    defaultRetry:
      envSettings?.network?.defaultRetry ?? (Number(import.meta.env.VITE_DEFAULT_RETRY) || 3),
  },
  search: {
    isSearchHistoryEnabled:
      envSettings?.search?.isSearchHistoryEnabled ??
      import.meta.env.VITE_SEARCH_HISTORY_ENABLED !== 'false',
    isSearchHistoryVisible: envSettings?.search?.isSearchHistoryVisible ?? true,
    searchCacheExpiryHours: envSettings?.search?.searchCacheExpiryHours ?? 24,
  },
  playback: {
    isViewingHistoryEnabled:
      envSettings?.playback?.isViewingHistoryEnabled ??
      import.meta.env.VITE_VIEWING_HISTORY_ENABLED !== 'false',
    isViewingHistoryVisible: envSettings?.playback?.isViewingHistoryVisible ?? true,
    isAutoPlayEnabled:
      envSettings?.playback?.isAutoPlayEnabled ?? import.meta.env.VITE_AUTOPLAY_ENABLED === 'true',
    defaultEpisodeOrder:
      envSettings?.playback?.defaultEpisodeOrder ??
      ((import.meta.env.VITE_DEFAULT_EPISODE_ORDER as 'asc' | 'desc') || 'asc'),
    adFilteringEnabled:
      envSettings?.playback?.adFilteringEnabled ??
      import.meta.env.VITE_AD_FILTERING_ENABLED !== 'false',
  },
  system: {
    isUpdateLogEnabled: envSettings?.system?.isUpdateLogEnabled ?? true,
  },
}
