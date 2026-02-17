import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { TmdbMediaItem } from '@/shared/types/tmdb'

const { multiMock } = vi.hoisted(() => ({
  multiMock: vi.fn(),
}))

vi.mock('@/shared/lib/tmdb', () => ({
  getTmdbClient: () => ({
    search: {
      multi: multiMock,
    },
  }),
  normalizeToMediaItem: (raw: Record<string, unknown>, mediaType: 'movie' | 'tv'): TmdbMediaItem => ({
    id: raw.id as number,
    mediaType,
    title: String(raw.title ?? raw.name ?? ''),
    originalTitle: '',
    overview: '',
    posterPath: null,
    backdropPath: null,
    logoPath: null,
    releaseDate: '',
    voteAverage: 0,
    voteCount: 0,
    popularity: 0,
    genreIds: [],
    originalLanguage: 'zh',
    originCountry: [],
  }),
}))

import { useTmdbStore } from './tmdbStore'

function createDeferred<T>() {
  let resolve: (value: T) => void = () => {}
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    void rej
  })
  return { promise, resolve }
}

function createSearchResponse(id: number, title: string) {
  return {
    page: 1,
    total_pages: 1,
    total_results: 1,
    results: [
      {
        id,
        media_type: 'movie',
        title,
      },
    ],
  }
}

describe('tmdbStore search 竞态保护', () => {
  beforeEach(() => {
    multiMock.mockReset()

    const loading = useTmdbStore.getState().loading
    useTmdbStore.setState({
      searchQuery: '',
      searchResults: [],
      filteredResults: [],
      searchPagination: { page: 1, totalPages: 0, totalResults: 0 },
      loading: { ...loading, search: false },
      error: null,
    })
  })

  it('只提交最后一次请求的结果', async () => {
    const first = createDeferred<ReturnType<typeof createSearchResponse>>()
    const second = createDeferred<ReturnType<typeof createSearchResponse>>()

    multiMock
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise)

    const firstSearch = useTmdbStore.getState().search('old query', 1)
    const secondSearch = useTmdbStore.getState().search('new query', 1)

    second.resolve(createSearchResponse(2, 'new-result'))
    await secondSearch

    first.resolve(createSearchResponse(1, 'old-result'))
    await firstSearch

    const state = useTmdbStore.getState()
    expect(state.searchQuery).toBe('new query')
    expect(state.searchResults).toHaveLength(1)
    expect(state.searchResults[0]?.id).toBe(2)
    expect(state.loading.search).toBe(false)
  })
})
