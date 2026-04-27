import type { SyncSnapshot } from '../types'

const cloneValue = <T>(value: T): T => {
  return JSON.parse(JSON.stringify(value)) as T
}

const toTimestamp = (value: number | string | Date | null | undefined): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  if (value instanceof Date) return value.getTime()
  return 0
}

const buildViewingHistoryKey = (item: SyncSnapshot['viewingHistory'][number]): string => {
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

const mergeArrayByKey = <T>(
  currentItems: T[],
  incomingItems: T[],
  keySelector: (item: T) => string,
  updatedAtSelector: (item: T) => number,
): T[] => {
  const merged = new Map<string, T>()

  currentItems.forEach(item => {
    merged.set(keySelector(item), cloneValue(item))
  })

  incomingItems.forEach(item => {
    const key = keySelector(item)
    const existing = merged.get(key)
    if (!existing) {
      merged.set(key, cloneValue(item))
      return
    }

    if (updatedAtSelector(item) >= updatedAtSelector(existing)) {
      merged.set(key, cloneValue(item))
    }
  })

  return Array.from(merged.values())
}

const getNestedValue = (target: Record<string, unknown>, path: string): unknown => {
  return path.split('.').reduce<unknown>((current, part) => {
    if (!current || typeof current !== 'object') return undefined
    return (current as Record<string, unknown>)[part]
  }, target)
}

const setNestedValue = (target: Record<string, unknown>, path: string, value: unknown): void => {
  const parts = path.split('.')
  const lastPart = parts.pop()
  if (!lastPart) return

  const parent = parts.reduce<Record<string, unknown>>((current, part) => {
    const next = current[part]
    if (!next || typeof next !== 'object') {
      current[part] = {}
    }
    return current[part] as Record<string, unknown>
  }, target)

  parent[lastPart] = value
}

const mergeSettings = (
  currentSettings: SyncSnapshot['settings'],
  incomingSettings: SyncSnapshot['settings'],
): SyncSnapshot['settings'] => {
  const merged = cloneValue(currentSettings) as unknown as Record<string, unknown>
  const mergedFieldUpdatedAt = { ...currentSettings.fieldUpdatedAt }
  const fieldKeys = new Set([
    ...Object.keys(currentSettings.fieldUpdatedAt),
    ...Object.keys(incomingSettings.fieldUpdatedAt),
  ])

  fieldKeys.forEach(fieldPath => {
    const currentTimestamp = currentSettings.fieldUpdatedAt[fieldPath] ?? 0
    const incomingTimestamp = incomingSettings.fieldUpdatedAt[fieldPath] ?? 0
    const nextValue =
      incomingTimestamp >= currentTimestamp
        ? getNestedValue(incomingSettings as unknown as Record<string, unknown>, fieldPath)
        : getNestedValue(currentSettings as unknown as Record<string, unknown>, fieldPath)

    if (nextValue !== undefined) {
      setNestedValue(merged, fieldPath, cloneValue(nextValue))
    }

    mergedFieldUpdatedAt[fieldPath] = Math.max(currentTimestamp, incomingTimestamp)
  })

  return {
    ...(merged as unknown as SyncSnapshot['settings']),
    fieldUpdatedAt: mergedFieldUpdatedAt,
  }
}

export const mergeSyncSnapshots = (
  currentSnapshot: SyncSnapshot,
  incomingSnapshot: SyncSnapshot,
): SyncSnapshot => {
  return {
    favorites: mergeArrayByKey(
      currentSnapshot.favorites,
      incomingSnapshot.favorites,
      item => item.id,
      item => item.updatedAt ?? item.addedAt ?? 0,
    ).sort((left, right) => right.addedAt - left.addedAt),
    viewingHistory: mergeArrayByKey(
      currentSnapshot.viewingHistory,
      incomingSnapshot.viewingHistory,
      buildViewingHistoryKey,
      item => item.timestamp,
    ).sort((left, right) => right.timestamp - left.timestamp),
    searchHistory: mergeArrayByKey(
      currentSnapshot.searchHistory,
      incomingSnapshot.searchHistory,
      item => item.id,
      item => item.updatedAt,
    ).sort((left, right) => right.updatedAt - left.updatedAt),
    theme:
      incomingSnapshot.theme.updatedAt >= currentSnapshot.theme.updatedAt
        ? cloneValue(incomingSnapshot.theme)
        : cloneValue(currentSnapshot.theme),
    settings: mergeSettings(currentSnapshot.settings, incomingSnapshot.settings),
    adFilteringEnabled:
      incomingSnapshot.adFilteringEnabled.updatedAt >=
      currentSnapshot.adFilteringEnabled.updatedAt
        ? cloneValue(incomingSnapshot.adFilteringEnabled)
        : cloneValue(currentSnapshot.adFilteringEnabled),
    videoSources: mergeArrayByKey(
      currentSnapshot.videoSources,
      incomingSnapshot.videoSources,
      item => item.id,
      item => toTimestamp(item.updatedAt),
    ).sort((left, right) => {
      if (left.sortIndex !== right.sortIndex) {
        return left.sortIndex - right.sortIndex
      }
      return toTimestamp(right.updatedAt) - toTimestamp(left.updatedAt)
    }),
    subscriptions: mergeArrayByKey(
      currentSnapshot.subscriptions,
      incomingSnapshot.subscriptions,
      item => item.id,
      item => toTimestamp(item.updatedAt),
    ).sort((left, right) => toTimestamp(left.createdAt) - toTimestamp(right.createdAt)),
  }
}
