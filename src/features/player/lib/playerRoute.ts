import type { TmdbMediaType } from '@/shared/types/tmdb'

interface PlayerRouteValidationParams {
  type?: string
  tmdbId?: string
  sourceCode?: string
  vodId?: string
}

interface PlayerRouteValidationBase {
  isValid: boolean
}

export interface PlayerRouteValidationTmdbResult extends PlayerRouteValidationBase {
  isValid: true
  mode: 'tmdb'
  tmdbMediaType: TmdbMediaType
  tmdbId: number
}

export interface PlayerRouteValidationCmsResult extends PlayerRouteValidationBase {
  isValid: true
  mode: 'cms'
  sourceCode: string
  vodId: string
}

export interface PlayerRouteValidationInvalidResult extends PlayerRouteValidationBase {
  isValid: false
  mode: 'invalid'
  message: string
}

export type PlayerRouteValidationResult =
  | PlayerRouteValidationTmdbResult
  | PlayerRouteValidationCmsResult
  | PlayerRouteValidationInvalidResult

export const INVALID_PLAYER_ROUTE_MESSAGE = '无效的播放地址，请返回重试'

export const isSupportedTmdbMediaType = (value: string): value is TmdbMediaType =>
  value === 'movie' || value === 'tv'

export function validatePlayerRoute(params: PlayerRouteValidationParams): PlayerRouteValidationResult {
  const type = params.type?.trim() || ''
  const tmdbIdText = params.tmdbId?.trim() || ''
  const sourceCode = params.sourceCode?.trim() || ''
  const vodId = params.vodId?.trim() || ''

  if (sourceCode && vodId) {
    return {
      isValid: true,
      mode: 'cms',
      sourceCode,
      vodId,
    }
  }

  const hasTmdbPathParams = Boolean(type || tmdbIdText)
  if (hasTmdbPathParams) {
    if (!isSupportedTmdbMediaType(type)) {
      return {
        isValid: false,
        mode: 'invalid',
        message: INVALID_PLAYER_ROUTE_MESSAGE,
      }
    }

    const parsedTmdbId = Number.parseInt(tmdbIdText, 10)
    if (!Number.isInteger(parsedTmdbId) || parsedTmdbId <= 0) {
      return {
        isValid: false,
        mode: 'invalid',
        message: INVALID_PLAYER_ROUTE_MESSAGE,
      }
    }

    return {
      isValid: true,
      mode: 'tmdb',
      tmdbMediaType: type,
      tmdbId: parsedTmdbId,
    }
  }

  return {
    isValid: false,
    mode: 'invalid',
    message: INVALID_PLAYER_ROUTE_MESSAGE,
  }
}
