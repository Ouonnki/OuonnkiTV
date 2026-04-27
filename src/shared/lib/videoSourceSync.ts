import type { VideoSource } from '@ouonnki/cms-core'

export type VideoSourceOrigin = 'env' | 'manual' | 'subscription'

const ENV_SOURCE_PREFIX = 'env_source_'
const SUBSCRIPTION_SOURCE_PREFIX = 'sub:'

export const inferVideoSourceOrigin = (sourceId: string): VideoSourceOrigin => {
  if (sourceId.startsWith(SUBSCRIPTION_SOURCE_PREFIX)) {
    return 'subscription'
  }
  if (sourceId.startsWith(ENV_SOURCE_PREFIX)) {
    return 'env'
  }
  return 'manual'
}

export const normalizeVideoSource = (
  source: VideoSource,
  sortIndex: number,
  fallbackOrigin?: VideoSourceOrigin,
): VideoSource => {
  return {
    ...source,
    syncOrigin: source.syncOrigin ?? fallbackOrigin ?? inferVideoSourceOrigin(source.id),
    sortIndex: source.sortIndex ?? sortIndex,
  }
}

export const isManualVideoSource = (source: VideoSource): boolean => {
  return (source.syncOrigin ?? inferVideoSourceOrigin(source.id)) === 'manual'
}
