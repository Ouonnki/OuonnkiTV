import type { VideoSource } from '@ouonnki/cms-core'

export interface SourcePaginationInfo {
  totalPages: number
  totalResults: number
}

export function getSourcesToFetch(
  selectedAPIs: VideoSource[],
  cachedSources: Map<string, SourcePaginationInfo>,
  page: number,
): VideoSource[] {
  return selectedAPIs.filter(source => {
    const cached = cachedSources.get(source.id)
    if (!cached) return true
    return page <= cached.totalPages
  })
}
