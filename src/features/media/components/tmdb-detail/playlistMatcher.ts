import type { VideoItem } from '@ouonnki/cms-core'
import type { TmdbMediaType } from '@/shared/types/tmdb'
import type { DetailSeason } from './types'

export interface PlaylistMatchItem {
  item: VideoItem
  score: number
  titleSimilarity: number
  seasonHints: number[]
}

export interface SourceBestMatch {
  sourceCode: string
  sourceName: string
  bestMatch: PlaylistMatchItem | null
  alternatives: PlaylistMatchItem[]
}

export interface SeasonSourceMatches {
  season: DetailSeason
  sourceMatches: SourceBestMatch[]
}

interface SourceMeta {
  id: string
  name: string
}

interface BuildPlaylistMatchesParams {
  mediaType: TmdbMediaType
  items: VideoItem[]
  title: string
  originalTitle?: string
  releaseYear?: string
  seasons: DetailSeason[]
  sources: SourceMeta[]
}

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const toBigrams = (value: string): string[] => {
  if (value.length < 2) return value ? [value] : []
  const output: string[] = []
  for (let i = 0; i < value.length - 1; i += 1) {
    output.push(value.slice(i, i + 2))
  }
  return output
}

const calcDiceSimilarity = (a: string, b: string): number => {
  if (!a || !b) return 0
  if (a === b) return 1
  if (a.includes(b) || b.includes(a)) return 0.93

  const aBigrams = toBigrams(a)
  const bBigrams = toBigrams(b)
  if (aBigrams.length === 0 || bBigrams.length === 0) return 0

  const bMap = new Map<string, number>()
  bBigrams.forEach(token => bMap.set(token, (bMap.get(token) || 0) + 1))

  let overlap = 0
  aBigrams.forEach(token => {
    const current = bMap.get(token) || 0
    if (current > 0) {
      overlap += 1
      bMap.set(token, current - 1)
    }
  })

  return (2 * overlap) / (aBigrams.length + bBigrams.length)
}

const parseChineseNumber = (value: string): number | null => {
  const normalized = value.replace(/\s+/g, '')
  if (!normalized) return null

  const map: Record<string, number> = {
    零: 0,
    〇: 0,
    一: 1,
    二: 2,
    两: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
  }

  if (normalized === '十') return 10

  if (normalized.includes('十')) {
    const [left, right] = normalized.split('十')
    const tens = left ? map[left] : 1
    const units = right ? map[right] || 0 : 0
    if (Number.isFinite(tens)) {
      return tens * 10 + units
    }
  }

  if (normalized.length === 1 && normalized in map) {
    return map[normalized]
  }

  return null
}

const extractSeasonHints = (item: VideoItem): number[] => {
  const text = `${item.vod_name || ''} ${item.vod_remarks || ''} ${item.type_name || ''}`
  const hints = new Set<number>()

  const seasonRegex = /(?:第\s*([0-9一二两三四五六七八九十〇零]{1,3})\s*[季部篇])|(?:\bS(?:EASON)?\s*0*([0-9]{1,2})\b)|(?:\b([0-9]{1,2})\s*季\b)/gi

  let match: RegExpExecArray | null = seasonRegex.exec(text)
  while (match) {
    const [, cnValue, enValue, numValue] = match
    const numeric = enValue || numValue
    const seasonNumber = numeric
      ? Number.parseInt(numeric, 10)
      : cnValue
        ? parseChineseNumber(cnValue)
        : null

    if (seasonNumber && Number.isFinite(seasonNumber) && seasonNumber > 0 && seasonNumber < 100) {
      hints.add(seasonNumber)
    }

    match = seasonRegex.exec(text)
  }

  return Array.from(hints)
}

const scoreTitleSimilarity = (item: VideoItem, title: string, originalTitle?: string) => {
  const candidateName = normalizeText(item.vod_name || '')
  if (!candidateName) return 0

  const titlePrimary = normalizeText(title)
  const titleOriginal = normalizeText(originalTitle || '')

  const primaryScore = calcDiceSimilarity(candidateName, titlePrimary)
  const originalScore = titleOriginal ? calcDiceSimilarity(candidateName, titleOriginal) : 0

  return Math.max(primaryScore, originalScore)
}

const scoreItem = (
  item: VideoItem,
  mediaType: TmdbMediaType,
  title: string,
  originalTitle: string | undefined,
  releaseYear: string | undefined,
): PlaylistMatchItem | null => {
  const titleSimilarity = scoreTitleSimilarity(item, title, originalTitle)
  if (titleSimilarity < 0.28) return null

  let score = Math.round(titleSimilarity * 100)

  if (releaseYear && item.vod_year && item.vod_year === releaseYear) {
    score += 14
  }

  const typeText = `${item.type_name || ''} ${item.vod_remarks || ''}`.toLowerCase()
  if (mediaType === 'movie') {
    if (/电影|movie|院线/.test(typeText)) score += 8
    if (/季|集|连载|更新/.test(typeText)) score -= 10
  } else {
    if (/剧|动漫|番|season|季|集/.test(typeText)) score += 8
    if (/电影|movie|院线/.test(typeText)) score -= 12
  }

  if (/预告|花絮|解说|剪辑|速看/.test(typeText)) {
    score -= 15
  }

  return {
    item,
    score,
    titleSimilarity,
    seasonHints: extractSeasonHints(item),
  }
}

const dedupeByVod = (items: PlaylistMatchItem[]) => {
  const map = new Map<string, PlaylistMatchItem>()
  items.forEach(entry => {
    const key = `${entry.item.source_code || 'unknown'}::${entry.item.vod_id}`
    const existing = map.get(key)
    if (!existing || existing.score < entry.score) {
      map.set(key, entry)
    }
  })

  return Array.from(map.values()).sort((a, b) => b.score - a.score)
}

const groupBySource = (items: PlaylistMatchItem[]) => {
  const grouped = new Map<string, PlaylistMatchItem[]>()
  items.forEach(entry => {
    const sourceCode = entry.item.source_code || 'unknown'
    const list = grouped.get(sourceCode) || []
    list.push(entry)
    grouped.set(sourceCode, list)
  })
  grouped.forEach(list => list.sort((a, b) => b.score - a.score))
  return grouped
}

const buildSourceOrder = (sources: SourceMeta[], grouped: Map<string, PlaylistMatchItem[]>) => {
  const ordered: SourceMeta[] = [...sources]
  const sourceSet = new Set(sources.map(source => source.id))

  grouped.forEach((entries, sourceCode) => {
    if (!sourceSet.has(sourceCode)) {
      ordered.push({
        id: sourceCode,
        name: entries[0]?.item.source_name || sourceCode || '未知源',
      })
    }
  })

  return ordered
}

const toSourceMatches = (
  grouped: Map<string, PlaylistMatchItem[]>,
  orderedSources: SourceMeta[],
): SourceBestMatch[] => {
  const matches = orderedSources.map(source => {
    const entries = grouped.get(source.id) || []
    return {
      sourceCode: source.id,
      sourceName: source.name,
      bestMatch: entries[0] || null,
      alternatives: entries.slice(1),
    }
  })

  // 源排序：按最佳匹配的综合分从高到低，无匹配项排最后
  return matches.sort((a, b) => {
    const aScore = a.bestMatch?.score ?? -1
    const bScore = b.bestMatch?.score ?? -1
    if (bScore !== aScore) return bScore - aScore
    return (a.sourceName || a.sourceCode).localeCompare(b.sourceName || b.sourceCode, 'zh-Hans-CN')
  })
}

const applySeasonScore = (entry: PlaylistMatchItem, seasonNumber: number): PlaylistMatchItem => {
  let seasonScore = entry.score

  if (entry.seasonHints.length > 0) {
    if (entry.seasonHints.includes(seasonNumber)) {
      seasonScore += 36
    } else {
      seasonScore -= 24
    }
  } else if (seasonNumber === 1) {
    seasonScore += 8
  }

  return {
    ...entry,
    score: seasonScore,
  }
}

export function buildPlaylistMatches({
  mediaType,
  items,
  title,
  originalTitle,
  releaseYear,
  seasons,
  sources,
}: BuildPlaylistMatchesParams) {
  const scored = items
    .map(item => scoreItem(item, mediaType, title, originalTitle, releaseYear))
    .filter((entry): entry is PlaylistMatchItem => Boolean(entry))

  const deduped = dedupeByVod(scored)
  const grouped = groupBySource(deduped)
  const orderedSources = buildSourceOrder(sources, grouped)

  if (mediaType === 'movie') {
    return {
      candidates: deduped,
      movieSourceMatches: toSourceMatches(grouped, orderedSources),
      seasonSourceMatches: [] as SeasonSourceMatches[],
    }
  }

  const tvSeasons = seasons.filter(season => season.season_number > 0)
  const seasonSourceMatches: SeasonSourceMatches[] = tvSeasons.map(season => {
    const seasonGrouped = new Map<string, PlaylistMatchItem[]>()

    grouped.forEach((entries, sourceCode) => {
      const scoredEntries = entries
        .map(entry => applySeasonScore(entry, season.season_number))
        .sort((a, b) => b.score - a.score)
      seasonGrouped.set(sourceCode, scoredEntries)
    })

    return {
      season,
      sourceMatches: toSourceMatches(seasonGrouped, orderedSources),
    }
  })

  return {
    candidates: deduped,
    movieSourceMatches: [] as SourceBestMatch[],
    seasonSourceMatches,
  }
}
