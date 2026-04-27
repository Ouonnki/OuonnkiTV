const SETTING_FIELD_GROUPS = {
  network: ['defaultTimeout', 'defaultRetry', 'concurrencyLimit', 'isProxyEnabled', 'proxyUrl'],
  search: ['isSearchHistoryEnabled', 'isSearchHistoryVisible', 'maxSearchHistoryCount'],
  playback: [
    'isViewingHistoryEnabled',
    'isViewingHistoryVisible',
    'isAutoPlayEnabled',
    'defaultEpisodeOrder',
    'defaultVolume',
    'playerThemeColor',
    'maxViewingHistoryCount',
    'tmdbMatchCacheTTLHours',
    'isLoopEnabled',
    'isPipEnabled',
    'isAutoMiniEnabled',
    'isScreenshotEnabled',
    'isMobileGestureEnabled',
    'longPressPlaybackRate',
    'isFullscreenProgressHidden',
  ],
  system: [
    'tmdbEnabled',
    'tmdbApiToken',
    'tmdbApiBaseUrl',
    'tmdbImageBaseUrl',
    'isUpdateLogEnabled',
    'isScrollChromeAnimationEnabled',
    'tmdbLanguage',
    'tmdbImageQuality',
  ],
} as const

export type SettingsFieldUpdatedAt = Record<string, number>

const buildFieldPath = (group: string, field: string): string => `${group}.${field}`

export const NON_SENSITIVE_SETTING_FIELDS = Object.entries(SETTING_FIELD_GROUPS)
  .flatMap(([group, fields]) => fields.map(field => buildFieldPath(group, field)))
  .filter(field => field !== 'system.tmdbApiToken')

export const buildDefaultSettingsFieldUpdatedAt = (
  timestamp = Date.now(),
): SettingsFieldUpdatedAt => {
  return Object.entries(SETTING_FIELD_GROUPS).reduce<SettingsFieldUpdatedAt>(
    (accumulator, [group, fields]) => {
      fields.forEach(field => {
        accumulator[buildFieldPath(group, field)] = timestamp
      })
      return accumulator
    },
    {},
  )
}

export const updateSettingsFieldUpdatedAt = (
  current: SettingsFieldUpdatedAt,
  group: keyof typeof SETTING_FIELD_GROUPS,
  updates: Record<string, unknown>,
  timestamp = Date.now(),
): SettingsFieldUpdatedAt => {
  const next = { ...current }

  Object.keys(updates).forEach(field => {
    if (SETTING_FIELD_GROUPS[group].includes(field as never)) {
      next[buildFieldPath(group, field)] = timestamp
    }
  })

  return next
}

export const filterNonSensitiveSettingsFieldUpdatedAt = (
  current: SettingsFieldUpdatedAt,
): SettingsFieldUpdatedAt => {
  return NON_SENSITIVE_SETTING_FIELDS.reduce<SettingsFieldUpdatedAt>((accumulator, field) => {
    const timestamp = current[field]
    if (typeof timestamp === 'number') {
      accumulator[field] = timestamp
    }
    return accumulator
  }, {})
}
