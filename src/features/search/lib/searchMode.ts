export type SearchMode = 'tmdb' | 'direct'

export function normalizeSearchMode(
  modeParam: string | null | undefined,
  tmdbEnabled: boolean = true,
): SearchMode {
  if (!tmdbEnabled) return 'direct'
  return modeParam === 'direct' ? 'direct' : 'tmdb'
}
