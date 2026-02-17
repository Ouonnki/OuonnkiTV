export type SearchMode = 'tmdb' | 'direct'

export function normalizeSearchMode(modeParam: string | null | undefined): SearchMode {
  return modeParam === 'direct' ? 'direct' : 'tmdb'
}
