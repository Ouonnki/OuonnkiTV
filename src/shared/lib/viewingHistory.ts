import { buildCmsPlayPath, buildTmdbPlayPath } from './routes'
import type { ViewingHistoryItem } from '@/shared/types'

type TmdbHistoryItem = ViewingHistoryItem & {
  recordType: 'tmdb'
  tmdbMediaType: 'movie' | 'tv'
  tmdbId: number
}

const getNormalizedSeasonNumber = (item: ViewingHistoryItem): number | null => {
  if (item.tmdbMediaType !== 'tv') return null
  return item.tmdbSeasonNumber ?? null
}

export const isTmdbHistoryItem = (item: ViewingHistoryItem): item is TmdbHistoryItem => {
  return (
    item.recordType === 'tmdb' &&
    (item.tmdbMediaType === 'movie' || item.tmdbMediaType === 'tv') &&
    typeof item.tmdbId === 'number'
  )
}

export const getHistoryItemKey = (item: ViewingHistoryItem): string => {
  if (isTmdbHistoryItem(item)) {
    return `tmdb::${item.tmdbMediaType}::${item.tmdbId}::${getNormalizedSeasonNumber(item) ?? 'none'}::${item.episodeIndex}`
  }

  return `cms::${item.sourceCode}::${item.vodId}::${item.episodeIndex}`
}

export const getHistorySeriesKey = (item: ViewingHistoryItem): string => {
  if (isTmdbHistoryItem(item)) {
    return `tmdb::${item.tmdbMediaType}::${item.tmdbId}`
  }

  return `cms::${item.sourceCode}::${item.vodId}`
}

export const buildHistoryPlayPath = (item: ViewingHistoryItem): string => {
  if (isTmdbHistoryItem(item)) {
    return buildTmdbPlayPath(item.tmdbMediaType, item.tmdbId, {
      sourceCode: item.sourceCode,
      vodId: item.vodId,
      episodeIndex: item.episodeIndex,
      seasonNumber: item.tmdbMediaType === 'tv' ? item.tmdbSeasonNumber ?? undefined : undefined,
    })
  }

  return buildCmsPlayPath(item.sourceCode, item.vodId, item.episodeIndex)
}
