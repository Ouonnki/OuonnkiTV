import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { DetailHeroSection } from './DetailHeroSection'
import type { TmdbRichDetail } from './types'

const detail: TmdbRichDetail = {
  id: 1,
  mediaType: 'movie',
  title: '测试影片',
  originalTitle: 'Test',
  overview: '影片简介',
  posterPath: null,
  backdropPath: null,
  logoPath: null,
  releaseDate: '2026-01-01',
  voteAverage: 8,
  voteCount: 10,
  popularity: 10,
  genreIds: [],
  originalLanguage: 'zh',
  originCountry: [],
  runtime: 90,
  status: 'Released',
  tagline: '',
}

describe('detail hero overlay controls', () => {
  it.each([undefined, '已观看 10%'])(
    'only hides the continue label when a replacement exists: %s',
    progress => {
      const container = document.createElement('div')
      container.innerHTML = renderToStaticMarkup(
        createElement(DetailHeroSection, {
          detail,
          richDetail: detail,
          tmdbType: 'movie',
          releaseYear: '2026',
          runtimeLabel: '90 分钟',
          adultLevel: '',
          heroLogo: null,
          favorited: false,
          onBack: vi.fn(),
          onPlayNow: vi.fn(),
          onToggleFavorite: vi.fn(),
          onContinueWatching: vi.fn(),
          continueWatchingProgressLabel: progress,
        }),
      )
      const button = [...container.querySelectorAll('button')].find(button =>
        button.textContent?.includes('继续观看'),
      )!
      const label = button.querySelector('span')!
      expect(label.classList.contains('group-hover:opacity-0')).toBe(false)
      expect(label.classList.contains('sm:group-hover:opacity-0')).toBe(Boolean(progress))
    },
  )
  it('keeps the back button readable on a dark backdrop in either theme', () => {
    const html = renderToStaticMarkup(
      createElement(DetailHeroSection, {
        detail,
        richDetail: detail,
        tmdbType: 'movie',
        releaseYear: '2026',
        runtimeLabel: '90 分钟',
        adultLevel: '',
        heroLogo: null,
        favorited: false,
        onBack: vi.fn(),
        onPlayNow: vi.fn(),
        onToggleFavorite: vi.fn(),
      }),
    )
    const container = document.createElement('div')
    container.innerHTML = html
    const back = [...container.querySelectorAll('button')].find(
      button => button.textContent === '返回',
    )!
    expect(back.classList.contains('text-white/90')).toBe(true)
    expect(back.classList.contains('hover:text-white')).toBe(true)
    expect(back.classList.contains('hover:text-primary')).toBe(false)
  })
})
