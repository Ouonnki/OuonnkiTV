import { describe, expect, it } from 'vitest'
import { derivePlayerViewState, shouldFallbackEpisodeToFirst } from './playerViewState'

describe('derivePlayerViewState', () => {
  it('错误存在时不应显示 loading', () => {
    const state = derivePlayerViewState({
      hasDetail: false,
      loading: true,
      error: '缺少参数',
      routeError: null,
      isTmdbRoute: true,
      tmdbLoading: true,
      tmdbError: null,
      tmdbPlaylistSearched: false,
    })

    expect(state.primaryError).toBe('缺少参数')
    expect(state.shouldShowLoading).toBe(false)
  })

  it('TMDB 首次匹配阶段应显示 loading', () => {
    const state = derivePlayerViewState({
      hasDetail: false,
      loading: false,
      error: null,
      routeError: null,
      isTmdbRoute: true,
      tmdbLoading: false,
      tmdbError: null,
      tmdbPlaylistSearched: false,
    })

    expect(state.shouldShowLoading).toBe(true)
  })
})

describe('shouldFallbackEpisodeToFirst', () => {
  it('分集越界时需要回落到第 1 集', () => {
    expect(shouldFallbackEpisodeToFirst(20, 50)).toBe(true)
  })

  it('分集未越界时不应回落', () => {
    expect(shouldFallbackEpisodeToFirst(20, 10)).toBe(false)
  })
})
