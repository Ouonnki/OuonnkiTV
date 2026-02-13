import { getCountryChineseName } from '@/shared/constants/countries'
import type { TmdbMediaItem, TmdbMediaType } from '@/shared/types/tmdb'
import type {
  DetailImage,
  DetailRecommendationRaw,
  DetailSpokenLanguage,
  TmdbRichDetail,
} from './types'

export const getReleaseYear = (value: string | undefined) => (value ? value.slice(0, 4) : '')

export const formatRuntime = (minutes: number) => {
  if (!Number.isFinite(minutes) || minutes <= 0) return ''
  const hour = Math.floor(minutes / 60)
  const min = minutes % 60
  if (hour === 0) return `${min}分钟`
  if (min === 0) return `${hour}小时`
  return `${hour}小时${min}分钟`
}

export const formatLargeNumber = (value: number | undefined) => {
  if (!Number.isFinite(value || 0)) return ''
  return new Intl.NumberFormat('zh-CN').format(value || 0)
}

export const formatCurrencyUSD = (value: number | undefined) => {
  if (!Number.isFinite(value || 0) || (value || 0) <= 0) return ''
  return `$${new Intl.NumberFormat('en-US').format(value || 0)}`
}

export const mapBooleanLabel = (value: boolean | undefined) => {
  if (value === undefined) return ''
  return value ? '是' : '否'
}

export const mapAdultLevel = (value: boolean | undefined) => {
  if (value === undefined) return ''
  return value ? 'NSFW' : 'SFW'
}

const normalizeRecommendation = (
  item: DetailRecommendationRaw,
  mediaType: TmdbMediaType,
): TmdbMediaItem | null => {
  const title = (item.title || item.name || '').trim()
  if (!title) return null

  return {
    id: item.id,
    mediaType,
    title,
    originalTitle: item.original_title || item.original_name || title,
    overview: item.overview || '',
    posterPath: item.poster_path ?? null,
    backdropPath: item.backdrop_path ?? null,
    logoPath: null,
    releaseDate: item.release_date || item.first_air_date || '',
    voteAverage: item.vote_average || 0,
    voteCount: item.vote_count || 0,
    popularity: item.popularity || 0,
    genreIds: item.genre_ids || [],
    originalLanguage: item.original_language || '',
    originCountry: item.origin_country || [],
  }
}

export const extractRecommendations = (detail: TmdbRichDetail, mediaType: TmdbMediaType) => {
  const fromRecommendations = detail.recommendations?.results || []
  const fromSimilar = detail.similar?.results || []
  const uniqueMap = new Map<number, TmdbMediaItem>()

  ;[...fromRecommendations, ...fromSimilar].forEach(item => {
    const normalized = normalizeRecommendation(item, mediaType)
    if (normalized && !uniqueMap.has(normalized.id)) {
      uniqueMap.set(normalized.id, normalized)
    }
  })

  return Array.from(uniqueMap.values()).slice(0, 18)
}

export const pickHeroLogo = (logos: DetailImage[]) => {
  if (logos.length === 0) return null
  const sorted = logos
    .slice()
    .sort(
      (a, b) => (b.vote_average || 0) - (a.vote_average || 0) || (b.vote_count || 0) - (a.vote_count || 0),
    )

  return sorted.find(item => item.iso_639_1 === 'zh') || sorted.find(item => item.iso_639_1 === 'en') || sorted[0]
}

const languageDisplayNames =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['zh-Hans', 'zh-CN', 'en'], { type: 'language' })
    : null

export const mapCountryCodeToName = (countryCode: string) => {
  const normalized = countryCode.trim().toUpperCase()
  if (!normalized) return ''
  return getCountryChineseName(normalized, null, null)
}

export const mapLanguageCodeToName = (languageCode: string | undefined, spokenLanguages: DetailSpokenLanguage[]) => {
  if (!languageCode) return ''
  const normalized = languageCode.toLowerCase()

  const matched = spokenLanguages.find(language => language.iso_639_1.toLowerCase() === normalized)
  if (matched) {
    return matched.name || matched.english_name || normalized
  }

  return languageDisplayNames?.of(normalized) || normalized
}

export const mapTvTypeLabel = (typeValue: string | undefined) => {
  if (!typeValue) return ''
  const mapping: Record<string, string> = {
    Scripted: '剧情剧',
    Reality: '真人秀',
    Documentary: '纪录片',
    News: '新闻节目',
    'Talk Show': '脱口秀',
    Miniseries: '迷你剧',
    Video: '视频节目',
  }
  return mapping[typeValue] || typeValue
}
