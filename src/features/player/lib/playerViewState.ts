interface DerivePlayerViewStateParams {
  hasDetail: boolean
  loading: boolean
  error: string | null
  routeError: string | null
  isTmdbRoute: boolean
  tmdbLoading: boolean
  tmdbPlaylistLoading: boolean
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
  const hasPendingLoad =
    params.loading ||
    (params.isTmdbRoute &&
      (params.tmdbLoading || params.tmdbPlaylistLoading || !params.tmdbPlaylistSearched))

  // 路由级错误必须立即展示；其余错误在新一轮加载开始时应让位于骨架屏，避免闪屏。
  if (params.routeError) {
    return {
      shouldShowLoading: false,
      primaryError: params.routeError,
    }
  }

  if (hasPendingLoad && !params.hasDetail) {
    return {
      shouldShowLoading: true,
      primaryError: null,
    }
  }

  const primaryError = params.tmdbError || params.error || null
  const shouldShowLoading = !params.hasDetail && !primaryError && hasPendingLoad

  return {
    shouldShowLoading,
    primaryError,
  }
}
