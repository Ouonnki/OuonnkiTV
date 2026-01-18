import { TMDB } from 'tmdb-ts'
import type { TmdbMediaItem, TmdbMediaType } from '../types/tmdb'

// 单例客户端
let tmdbClient: TMDB | null = null

export function getTmdbClient(): TMDB {
  if (!tmdbClient) {
    const token = import.meta.env.VITE_TMDB_API_TOKEN
    tmdbClient = new TMDB(token || '')
    if (!token) {
      console.warn('TMDB API Token is missing! Please set VITE_TMDB_API_TOKEN in .env')
    }
  }
  return tmdbClient
}

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/'

export function getPosterUrl(path: string | null, size = 'w500'): string {
  return path ? `${TMDB_IMAGE_BASE}${size}${path}` : ''
}

export function getBackdropUrl(path: string | null, size = 'original'): string {
  return path ? `${TMDB_IMAGE_BASE}${size}${path}` : ''
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
