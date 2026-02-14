import { useEffect, useMemo, useState } from 'react'

const parseRangeValue = (value: string) => {
  const [startText, endText] = value.split('-')
  const start = Number.parseInt(startText, 10)
  const end = Number.parseInt(endText, 10)
  if (Number.isNaN(start) || Number.isNaN(end)) {
    return null
  }
  return { start, end }
}

interface EpisodePageRange {
  label: string
  value: string
  start: number
  end: number
}

export interface EpisodePageItem {
  name: string
  displayIndex: number
  actualIndex: number
}

interface UseEpisodePaginationParams {
  episodes: string[]
  selectedEpisode: number
  defaultDescOrder: boolean
}

export function useEpisodePagination({
  episodes,
  selectedEpisode,
  defaultDescOrder,
}: UseEpisodePaginationParams) {
  const [isReversed, setIsReversed] = useState(defaultDescOrder)
  const [currentPageRange, setCurrentPageRange] = useState('')
  const [episodesPerPage, setEpisodesPerPage] = useState(100)

  useEffect(() => {
    const calculateEpisodesPerPage = () => {
      const width = window.innerWidth
      if (width >= 1280) {
        setEpisodesPerPage(12)
      } else if (width >= 1024) {
        setEpisodesPerPage(10)
      } else if (width >= 768) {
        setEpisodesPerPage(12)
      } else if (width >= 640) {
        setEpisodesPerPage(10)
      } else {
        setEpisodesPerPage(8)
      }
    }

    calculateEpisodesPerPage()
    window.addEventListener('resize', calculateEpisodesPerPage)
    return () => window.removeEventListener('resize', calculateEpisodesPerPage)
  }, [])

  const pageRanges = useMemo<EpisodePageRange[]>(() => {
    const totalEpisodes = episodes.length
    if (totalEpisodes === 0) return []

    const ranges: EpisodePageRange[] = []

    if (isReversed) {
      for (let i = 0; i < totalEpisodes; i += episodesPerPage) {
        const start = i
        const end = Math.min(i + episodesPerPage - 1, totalEpisodes - 1)
        ranges.push({
          label: `${totalEpisodes - start}-${totalEpisodes - end}`,
          value: `${start}-${end}`,
          start,
          end,
        })
      }
      return ranges
    }

    for (let i = 0; i < totalEpisodes; i += episodesPerPage) {
      const start = i
      const end = Math.min(i + episodesPerPage - 1, totalEpisodes - 1)
      ranges.push({
        label: `${start + 1}-${end + 1}`,
        value: `${start}-${end}`,
        start,
        end,
      })
    }

    return ranges
  }, [episodes, episodesPerPage, isReversed])

  useEffect(() => {
    if (pageRanges.length === 0) {
      setCurrentPageRange('')
      return
    }

    const totalEpisodes = episodes.length
    const displayIndex = isReversed ? totalEpisodes - 1 - selectedEpisode : selectedEpisode

    const containingRange = pageRanges.find(
      range => displayIndex >= range.start && displayIndex <= range.end,
    )

    setCurrentPageRange(containingRange?.value || pageRanges[0].value)
  }, [episodes.length, isReversed, pageRanges, selectedEpisode])

  const currentPageEpisodes = useMemo<EpisodePageItem[]>(() => {
    if (!currentPageRange || episodes.length === 0) return []

    const range = parseRangeValue(currentPageRange)
    if (!range) return []

    if (isReversed) {
      const list: EpisodePageItem[] = []
      for (let i = range.start; i <= range.end; i += 1) {
        const actualIndex = episodes.length - 1 - i
        if (actualIndex >= 0 && actualIndex < episodes.length) {
          list.push({
            name: episodes[actualIndex],
            displayIndex: i,
            actualIndex,
          })
        }
      }
      return list
    }

    return episodes.slice(range.start, range.end + 1).map((name, offset) => ({
      name,
      displayIndex: range.start + offset,
      actualIndex: range.start + offset,
    }))
  }, [currentPageRange, episodes, isReversed])

  const toActualIndex = (displayIndex: number) => {
    if (!isReversed) return displayIndex
    return episodes.length - 1 - displayIndex
  }

  return {
    isReversed,
    setIsReversed,
    currentPageRange,
    setCurrentPageRange,
    pageRanges,
    currentPageEpisodes,
    toActualIndex,
  }
}
