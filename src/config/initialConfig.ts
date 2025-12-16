interface SettingsConfig {
  network?: {
    defaultTimeout?: number
    defaultRetry?: number
  }
  search?: {
    isSearchHistoryEnabled?: boolean
    isSearchHistoryVisible?: boolean
    searchCacheExpiryHours?: number
  }
  playback?: {
    isViewingHistoryEnabled?: boolean
    isViewingHistoryVisible?: boolean
    isAutoPlayEnabled?: boolean
    defaultEpisodeOrder?: 'asc' | 'desc'
    adFilteringEnabled?: boolean
  }
  system?: {
    isUpdateLogEnabled?: boolean
  }
}

interface VideoSourceConfig {
  id?: string
  name: string
  url: string
  detailUrl?: string
  isEnabled?: boolean
  updatedAt?: string | Date
  timeout?: number
  retry?: number
}

interface MetaConfig {
  version: string
  exportDate: string
}

interface ExportedConfig {
  settings?: SettingsConfig
  videoSources?: VideoSourceConfig[]
  meta?: MetaConfig
}

export const getInitialConfig = (): ExportedConfig | null => {
  const envConfig = import.meta.env.VITE_INITIAL_CONFIG
  if (!envConfig || typeof envConfig !== 'string') return null

  try {
    // Remove potential surrounding quotes added by .env parsers or users
    const cleanedConfig = envConfig.trim().replace(/^['"](.*)['"]$/, '$1')
    const parsed = JSON.parse(cleanedConfig)
    return parsed
  } catch (e) {
    console.error('Failed to parse VITE_INITIAL_CONFIG:', e)
    return null
  }
}

export const INITIAL_CONFIG = getInitialConfig()
