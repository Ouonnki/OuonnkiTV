import type { TmdbMediaType } from '@/shared/types/tmdb'

const encodeSegment = (value: string | number) => encodeURIComponent(String(value))

interface TmdbPlayPathOptions {
  sourceCode?: string
  vodId?: string
  episodeIndex?: number
  seasonNumber?: number
}

export function buildTmdbDetailPath(mediaType: TmdbMediaType, tmdbId: number | string): string {
  return `/media/${mediaType}/${encodeSegment(tmdbId)}`
}

export function buildTmdbPlayPath(
  mediaType: TmdbMediaType,
  tmdbId: number | string,
  options: TmdbPlayPathOptions = {},
): string {
  const basePath = `/play/${mediaType}/${encodeSegment(tmdbId)}`
  const query = new URLSearchParams()

  if (options.sourceCode) {
    query.set('source', options.sourceCode)
  }

  if (options.vodId) {
    query.set('id', options.vodId)
  }

  if (typeof options.episodeIndex === 'number') {
    query.set('ep', String(options.episodeIndex))
  }

  if (typeof options.seasonNumber === 'number' && options.seasonNumber > 0) {
    query.set('season', String(options.seasonNumber))
  }

  const search = query.toString()
  return search ? `${basePath}?${search}` : basePath
}

export function buildCmsPlayPath(
  sourceCode: string,
  vodId: string,
  episodeIndex?: number,
): string {
  const basePath = `/play/cms/${encodeSegment(sourceCode)}/${encodeSegment(vodId)}`
  if (typeof episodeIndex !== 'number') {
    return basePath
  }
  return `${basePath}?ep=${episodeIndex}`
}
