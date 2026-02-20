interface DerivePlayerViewStateParams {
  hasDetail: boolean
  loading: boolean
  error: string | null
  routeError: string | null
  isTmdbRoute: boolean
  tmdbLoading: boolean
  tmdbError: string | null
  tmdbPlaylistSearched: boolean
}

interface PlayerViewStateResult {
  shouldShowLoading: boolean
  primaryError: string | null
}

export function shouldFallbackEpisodeToFirst(episodesLength: number, selectedEpisode: number): boolean {
  if (episodesLength === 0) return false
  return selectedEpisode >= episodesLength
}

export function derivePlayerViewState(params: DerivePlayerViewStateParams): PlayerViewStateResult {
  const primaryError = params.routeError || params.tmdbError || params.error || null
  const shouldShowLoading =
    !params.hasDetail &&
    !primaryError &&
    (params.loading ||
      (params.isTmdbRoute && (params.tmdbLoading || !params.tmdbPlaylistSearched)))

  return {
    shouldShowLoading,
    primaryError,
  }
}
