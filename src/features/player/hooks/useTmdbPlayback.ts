import { useMemo } from 'react'
import { useTmdbDetail } from '@/shared/hooks/useTmdb'
import type { TmdbMediaType, TmdbMovieDetail, TmdbTvDetail, TmdbMediaItem } from '@/shared/types/tmdb'
import {
  extractRecommendations,
  type SourceBestMatch,
  type TmdbRichDetail,
  usePlaylistMatches,
} from '@/features/media/components'

interface TmdbPlaybackParams {
  enabled: boolean
  mediaType: TmdbMediaType | null
  tmdbId: number
  querySourceCode: string
  querySeasonNumber: number | null
}

export interface PlayerSourceOption {
  sourceCode: string
  sourceName: string
  bestVodId: string
  bestScore: number
}

export interface PlayerSeasonOption {
  seasonNumber: number
  seasonName: string
  matchedSourceCount: number
}

const toSourceOptions = (matches: SourceBestMatch[]): PlayerSourceOption[] => {
  return matches
    .filter(match => Boolean(match.bestMatch?.item.vod_id))
    .map(match => ({
      sourceCode: match.sourceCode,
      sourceName: match.sourceName,
      bestVodId: match.bestMatch?.item.vod_id || '',
      bestScore: match.bestMatch?.score || 0,
    }))
}

export function useTmdbPlayback({
  enabled,
  mediaType,
  tmdbId,
  querySourceCode,
  querySeasonNumber,
}: TmdbPlaybackParams) {
  const validTmdbId = Number.isInteger(tmdbId) && tmdbId > 0
  const shouldEnableTmdbPlayback = enabled && validTmdbId && Boolean(mediaType)
  const tmdbType = mediaType || 'movie'

  const { detail, loading, error } = useTmdbDetail<TmdbMovieDetail | TmdbTvDetail>(
    shouldEnableTmdbPlayback ? tmdbId : undefined,
    tmdbType,
  )

  const richDetail = detail as TmdbRichDetail | null
  const seasons = useMemo(
    () =>
      mediaType === 'tv'
        ? (richDetail?.seasons || []).filter(season => season.season_number > 0)
        : [],
    [mediaType, richDetail?.seasons],
  )

  const playlist = usePlaylistMatches({
    active: shouldEnableTmdbPlayback && Boolean(detail),
    tmdbType,
    tmdbId,
    title: detail?.title || '',
    originalTitle: detail?.originalTitle || '',
    releaseDate: detail?.releaseDate || '',
    seasons,
  })

  const seasonSourceMap = useMemo(() => {
    const map = new Map<number, SourceBestMatch[]>()
    playlist.seasonSourceMatches.forEach(seasonMatch => {
      map.set(seasonMatch.season.season_number, seasonMatch.sourceMatches)
    })
    return map
  }, [playlist.seasonSourceMatches])

  const selectedSeasonNumber = useMemo(() => {
    if (mediaType !== 'tv' || seasons.length === 0) return null

    if (querySeasonNumber && seasons.some(season => season.season_number === querySeasonNumber)) {
      return querySeasonNumber
    }

    const firstPlayableSeason = playlist.seasonSourceMatches.find(seasonMatch =>
      seasonMatch.sourceMatches.some(sourceMatch => Boolean(sourceMatch.bestMatch)),
    )

    return firstPlayableSeason?.season.season_number || seasons[0].season_number
  }, [mediaType, playlist.seasonSourceMatches, querySeasonNumber, seasons])

  const activeSourceMatches = useMemo(() => {
    if (mediaType === 'movie') {
      return playlist.movieSourceMatches
    }

    if (mediaType === 'tv' && selectedSeasonNumber) {
      return seasonSourceMap.get(selectedSeasonNumber) || []
    }

    return []
  }, [mediaType, playlist.movieSourceMatches, seasonSourceMap, selectedSeasonNumber])

  const sourceOptions = useMemo(() => toSourceOptions(activeSourceMatches), [activeSourceMatches])

  const selectedSource = useMemo(() => {
    if (sourceOptions.length === 0) return null
    const matchedFromQuery = sourceOptions.find(option => option.sourceCode === querySourceCode)
    return matchedFromQuery || sourceOptions[0]
  }, [querySourceCode, sourceOptions])

  const resolvedSourceCode = selectedSource?.sourceCode || ''
  const resolvedVodId = selectedSource?.bestVodId || ''

  const seasonOptions = useMemo<PlayerSeasonOption[]>(() => {
    if (mediaType !== 'tv') return []

    return seasons.map(season => {
      const sourceMatches = seasonSourceMap.get(season.season_number) || []
      const matchedSourceCount = sourceMatches.filter(match => Boolean(match.bestMatch)).length

      return {
        seasonNumber: season.season_number,
        seasonName: season.name || `第 ${season.season_number} 季`,
        matchedSourceCount,
      }
    })
  }, [mediaType, seasonSourceMap, seasons])

  const recommendations = useMemo<TmdbMediaItem[]>(() => {
    if (!richDetail || !mediaType) return []
    return extractRecommendations(richDetail, mediaType)
  }, [mediaType, richDetail])

  const getSourceOptionsForSeason = (seasonNumber: number) => {
    const matches = seasonSourceMap.get(seasonNumber) || []
    return toSourceOptions(matches)
  }

  return {
    tmdbDetail: detail,
    tmdbRichDetail: richDetail,
    tmdbLoading: loading,
    tmdbError: error,
    playlist,
    recommendations,
    seasonOptions,
    selectedSeasonNumber,
    sourceOptions,
    resolvedSourceCode,
    resolvedVodId,
    getSourceOptionsForSeason,
  }
}
