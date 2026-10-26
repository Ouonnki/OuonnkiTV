import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { FeaturedCarousel } from './FeaturedCarousel'
import type { TmdbMediaItem } from '@/shared/types/tmdb'
import type { ViewingHistoryItem } from '@/shared/types/video'

vi.mock('@/shared/store/viewingHistoryStore', () => ({
  useViewingHistoryStore: (
    selector: (state: { viewingHistory: ViewingHistoryItem[] }) => unknown,
  ) =>
    selector({
      viewingHistory: [
        {
          recordType: 'tmdb',
          title: '测试影片',
          imageUrl: '',
          episodeIndex: 0,
          sourceCode: '',
          sourceName: '',
          vodId: '',
          timestamp: 1,
          playbackPosition: 10,
          duration: 100,
          tmdbMediaType: 'movie',
          tmdbId: 1,
        },
      ],
    }),
}))

const item: TmdbMediaItem = {
  id: 1,
  mediaType: 'movie',
  title: '测试影片',
  originalTitle: 'Test',
  overview: '',
  posterPath: null,
  backdropPath: '/test-backdrop.jpg',
  logoPath: null,
  releaseDate: '',
  voteAverage: 8,
  voteCount: 1,
  popularity: 1,
  genreIds: [],
  originalLanguage: 'zh',
  originCountry: [],
}

describe('featured continue-watching labels', () => {
  it('only replaces the label at the breakpoint where its progress is visible', () => {
    const html = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(FeaturedCarousel, { items: [item] })),
    )
    const container = document.createElement('div')
    container.innerHTML = html
    const replacements = [...container.querySelectorAll('span')].filter(
      span => span.textContent === '已观看 10%',
    )
    expect(replacements).toHaveLength(2)
    for (const progress of replacements) {
      const breakpoint = progress.classList.contains('xl:flex') ? 'xl' : 'md'
      const label = progress.previousElementSibling!
      expect(label.classList.contains(`${breakpoint}:group-hover:opacity-0`)).toBe(true)
      expect(label.classList.contains('group-hover:opacity-0')).toBe(false)
    }
  })
})
