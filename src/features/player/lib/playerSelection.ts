import type { TmdbMediaType } from '@/shared/types/tmdb'

export interface TmdbSelectionLock {
  scopeKey: string
  sourceCode: string
  vodId: string
}

interface ResolvePlayerSelectionParams {
  isCmsRoute: boolean
  isTmdbRoute: boolean
  routeSourceCode: string
  routeVodId: string
  querySourceCode: string
  queryVodId: string
  tmdbResolvedSourceCode: string
  tmdbResolvedVodId: string
  currentScopeKey: string
  lock: TmdbSelectionLock | null
}

interface NextTmdbSelectionLockParams {
  isTmdbRoute: boolean
  currentScopeKey: string
  querySourceCode: string
  queryVodId: string
  tmdbResolvedSourceCode: string
  tmdbResolvedVodId: string
  lock: TmdbSelectionLock | null
}

export function buildTmdbSelectionScopeKey(
  mediaType: TmdbMediaType | null,
  tmdbId: number,
  querySeasonNumber: number | null,
): string {
  if (!mediaType || !Number.isInteger(tmdbId) || tmdbId <= 0) return ''

  const seasonScope = mediaType === 'tv' ? (querySeasonNumber ?? 0) : 0
  return `${mediaType}:${tmdbId}:${seasonScope}`
}

export function resolvePlayerSelection(params: ResolvePlayerSelectionParams): {
  resolvedSourceCode: string
  resolvedVodId: string
  hasExplicitTmdbSelection: boolean
} {
  if (params.isCmsRoute) {
    return {
      resolvedSourceCode: params.routeSourceCode,
      resolvedVodId: params.routeVodId,
      hasExplicitTmdbSelection: false,
    }
  }

  const hasExplicitTmdbSelection = Boolean(params.querySourceCode && params.queryVodId)
  if (!params.isTmdbRoute) {
    return {
      resolvedSourceCode: params.tmdbResolvedSourceCode,
      resolvedVodId: params.tmdbResolvedVodId,
      hasExplicitTmdbSelection: false,
    }
  }

  if (hasExplicitTmdbSelection) {
    return {
      resolvedSourceCode: params.querySourceCode,
      resolvedVodId: params.queryVodId,
      hasExplicitTmdbSelection: true,
    }
  }

  const hasLockForScope =
    params.lock?.scopeKey === params.currentScopeKey && Boolean(params.lock.sourceCode && params.lock.vodId)

  if (hasLockForScope && params.lock) {
    return {
      resolvedSourceCode: params.lock.sourceCode,
      resolvedVodId: params.lock.vodId,
      hasExplicitTmdbSelection: false,
    }
  }

  return {
    resolvedSourceCode: params.tmdbResolvedSourceCode,
    resolvedVodId: params.tmdbResolvedVodId,
    hasExplicitTmdbSelection: false,
  }
}

export function getNextTmdbSelectionLock(params: NextTmdbSelectionLockParams): TmdbSelectionLock | null {
  if (!params.isTmdbRoute || !params.currentScopeKey) return null

  if (params.querySourceCode && params.queryVodId) {
    return {
      scopeKey: params.currentScopeKey,
      sourceCode: params.querySourceCode,
      vodId: params.queryVodId,
    }
  }

  if (params.lock?.scopeKey === params.currentScopeKey) {
    return params.lock
  }

  if (params.tmdbResolvedSourceCode && params.tmdbResolvedVodId) {
    return {
      scopeKey: params.currentScopeKey,
      sourceCode: params.tmdbResolvedSourceCode,
      vodId: params.tmdbResolvedVodId,
    }
  }

  return null
}
