import { TMDB } from 'tmdb-ts'
import { useSettingStore } from '@/shared/store/settingStore'
import type { TmdbMediaItem, TmdbMediaType } from '../types/tmdb'

// 单例客户端及其对应的 token，用于检测 token 变化并重建
let tmdbClient: TMDB | null = null
let currentToken: string | null = null

/**
 * 获取有效的 TMDB token
 * 优先使用用户手动配置的 token，其次使用环境变量 token
 */
function resolveTmdbToken(): string | undefined {
  const userToken = useSettingStore.getState().system.tmdbApiToken
  if (userToken) return userToken
  const envToken = import.meta.env.OKI_TMDB_API_TOKEN
  if (envToken) return envToken
  return undefined
}

export function getTmdbClient(): TMDB {
  const token = resolveTmdbToken()
  if (!token) {
    throw new Error('TMDB API Token 未配置，请在设置中手动输入或配置 OKI_TMDB_API_TOKEN 环境变量')
  }
  // token 变化时销毁旧单例并重建
  if (tmdbClient && currentToken === token) {
    return tmdbClient
  }
  tmdbClient = new TMDB(token)
  currentToken = token
  return tmdbClient
}

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/'

const POSTER_SIZE_MAP = { low: 'w342', medium: 'w500', high: 'w780' } as const
const BACKDROP_SIZE_MAP = { low: 'w780', medium: 'w1280', high: 'original' } as const

function getImageQuality(): 'low' | 'medium' | 'high' {
  return useSettingStore.getState().system.tmdbImageQuality
}

export function getPosterUrl(path: string | null, size?: string): string {
  const resolvedSize = size ?? POSTER_SIZE_MAP[getImageQuality()]
  return path ? `${TMDB_IMAGE_BASE}${resolvedSize}${path}` : ''
}

export function getBackdropUrl(path: string | null, size?: string): string {
  const resolvedSize = size ?? BACKDROP_SIZE_MAP[getImageQuality()]
  return path ? `${TMDB_IMAGE_BASE}${resolvedSize}${path}` : ''
}

export function getLogoUrl(path: string | null, size = 'w500'): string {
  return path ? `${TMDB_IMAGE_BASE}${size}${path}` : ''
}

// 数据转换器
export function normalizeToMediaItem(
  raw: Record<string, unknown>,
  type: TmdbMediaType,
): TmdbMediaItem {
  const isMovie = type === 'movie'

  // 处理日期
  const releaseDate = (isMovie ? raw.release_date : raw.first_air_date) as string

  // 处理标题
  const title = (isMovie ? raw.title : raw.name) as string
  const originalTitle = (isMovie ? raw.original_title : raw.original_name) as string

  // 处理产地 (TV通常有 origin_country, Movie通常没有，但在某些endpoint可能有)
  const originCountry = Array.isArray(raw.origin_country) ? (raw.origin_country as string[]) : []

  return {
    id: raw.id as number,
    mediaType: type,
    title: title || '',
    originalTitle: originalTitle || '',
    overview: (raw.overview as string) || '',
    posterPath: raw.poster_path as string | null,
    backdropPath: raw.backdrop_path as string | null,
    logoPath: (raw.logo_path as string | null) ?? null, // 初始为 null，后续可单独获取
    releaseDate: releaseDate || '',
    voteAverage: (raw.vote_average as number) || 0,
    voteCount: (raw.vote_count as number) || 0,
    popularity: (raw.popularity as number) || 0,
    genreIds: (raw.genre_ids as number[]) || [],
    originalLanguage: (raw.original_language as string) || '',
    originCountry,
  }
}
