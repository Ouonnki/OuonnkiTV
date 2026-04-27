function clonePlain(value) {
  return JSON.parse(JSON.stringify(value))
}

function toTimestamp(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  if (value instanceof Date) return value.getTime()
  return 0
}

function buildViewingHistoryKey(item) {
  if (item.recordType === 'tmdb') {
    return [
      'tmdb',
      item.tmdbMediaType ?? 'unknown',
      item.tmdbId ?? 'unknown',
      item.tmdbSeasonNumber ?? 'none',
      item.episodeIndex,
    ].join('::')
  }
  return ['cms', item.sourceCode, item.vodId, item.episodeIndex].join('::')
}

function mergeArrayByKey(currentItems, incomingItems, keySelector, updatedAtSelector) {
  const merged = new Map()

  currentItems.forEach(item => {
    merged.set(keySelector(item), clonePlain(item))
  })

  incomingItems.forEach(item => {
    const key = keySelector(item)
    const existing = merged.get(key)
    if (!existing) {
      merged.set(key, clonePlain(item))
      return
    }

    const existingTimestamp = updatedAtSelector(existing)
    const incomingTimestamp = updatedAtSelector(item)
    if (incomingTimestamp >= existingTimestamp) {
      merged.set(key, clonePlain(item))
    }
  })

  return Array.from(merged.values())
}

function getNestedValue(target, path) {
  return path.split('.').reduce((current, part) => {
    if (!current || typeof current !== 'object') return undefined
    return current[part]
  }, target)
}

function setNestedValue(target, path, value) {
  const parts = path.split('.')
  const lastPart = parts.pop()
  if (!lastPart) return

  const parent = parts.reduce((current, part) => {
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {}
    }
    return current[part]
  }, target)

  parent[lastPart] = value
}

function mergeSettings(currentSettings, incomingSettings) {
  const merged = clonePlain(currentSettings)
  const mergedFieldUpdatedAt = { ...currentSettings.fieldUpdatedAt }
  const fieldKeys = new Set([
    ...Object.keys(currentSettings.fieldUpdatedAt || {}),
    ...Object.keys(incomingSettings.fieldUpdatedAt || {}),
  ])

  fieldKeys.forEach(fieldPath => {
    const currentTimestamp = currentSettings.fieldUpdatedAt[fieldPath] ?? 0
    const incomingTimestamp = incomingSettings.fieldUpdatedAt[fieldPath] ?? 0
    const nextValue =
      incomingTimestamp >= currentTimestamp
        ? getNestedValue(incomingSettings, fieldPath)
        : getNestedValue(currentSettings, fieldPath)

    if (nextValue !== undefined) {
      setNestedValue(merged, fieldPath, clonePlain(nextValue))
    }

    mergedFieldUpdatedAt[fieldPath] = Math.max(currentTimestamp, incomingTimestamp)
  })

  merged.fieldUpdatedAt = mergedFieldUpdatedAt
  return merged
}

export function mergeSyncSnapshots(currentSnapshot, incomingSnapshot) {
  const favorites = mergeArrayByKey(
    currentSnapshot.favorites,
    incomingSnapshot.favorites,
    item => item.id,
    item => item.updatedAt ?? item.addedAt ?? 0,
  ).sort((left, right) => (right.addedAt ?? 0) - (left.addedAt ?? 0))

  const viewingHistory = mergeArrayByKey(
    currentSnapshot.viewingHistory,
    incomingSnapshot.viewingHistory,
    buildViewingHistoryKey,
    item => item.timestamp ?? 0,
  ).sort((left, right) => (right.timestamp ?? 0) - (left.timestamp ?? 0))

  const searchHistory = mergeArrayByKey(
    currentSnapshot.searchHistory,
    incomingSnapshot.searchHistory,
    item => item.id,
    item => item.updatedAt ?? item.createdAt ?? 0,
  ).sort((left, right) => (right.updatedAt ?? 0) - (left.updatedAt ?? 0))

  const theme =
    incomingSnapshot.theme.updatedAt >= currentSnapshot.theme.updatedAt
      ? clonePlain(incomingSnapshot.theme)
      : clonePlain(currentSnapshot.theme)

  const adFilteringEnabled =
    incomingSnapshot.adFilteringEnabled.updatedAt >= currentSnapshot.adFilteringEnabled.updatedAt
      ? clonePlain(incomingSnapshot.adFilteringEnabled)
      : clonePlain(currentSnapshot.adFilteringEnabled)

  const videoSources = mergeArrayByKey(
    currentSnapshot.videoSources,
    incomingSnapshot.videoSources,
    item => item.id,
    item => toTimestamp(item.updatedAt),
  ).sort((left, right) => {
    if (left.sortIndex !== right.sortIndex) {
      return left.sortIndex - right.sortIndex
    }
    return toTimestamp(right.updatedAt) - toTimestamp(left.updatedAt)
  })

  const subscriptions = mergeArrayByKey(
    currentSnapshot.subscriptions,
    incomingSnapshot.subscriptions,
    item => item.id,
    item => toTimestamp(item.updatedAt),
  ).sort((left, right) => toTimestamp(left.createdAt) - toTimestamp(right.createdAt))

  return {
    favorites,
    viewingHistory,
    searchHistory,
    theme,
    settings: mergeSettings(currentSnapshot.settings, incomingSnapshot.settings),
    adFilteringEnabled,
    videoSources,
    subscriptions,
  }
}
