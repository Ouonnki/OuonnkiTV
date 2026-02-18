import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTmdbMatchCacheStore } from './tmdbMatchCacheStore'

const CACHE_KEY = 'ouonnki-tv-tmdb-match-cache-store'

describe('tmdbMatchCacheStore', () => {
  beforeEach(() => {
    localStorage.removeItem(CACHE_KEY)
    useTmdbMatchCacheStore.setState({ entries: {} })
    vi.useRealTimers()
  })

  it('setEntry/getEntry 在有效期内命中', () => {
    const store = useTmdbMatchCacheStore.getState()

    store.setEntry('match-key', {
      searchedKeyword: '测试条目',
      candidates: [],
      movieSourceMatches: [],
      seasonSourceMatches: [],
    })

    const hit = useTmdbMatchCacheStore.getState().getEntry('match-key', 24)

    expect(hit).not.toBeNull()
    expect(hit?.payload.searchedKeyword).toBe('测试条目')
  })

  it('超过 TTL 后返回 miss 并惰性清理过期项', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

    const store = useTmdbMatchCacheStore.getState()
    store.setEntry('expired-key', {
      searchedKeyword: '过期条目',
      candidates: [],
      movieSourceMatches: [],
      seasonSourceMatches: [],
    })

    vi.setSystemTime(new Date('2026-01-02T01:00:00.000Z'))

    const miss = useTmdbMatchCacheStore.getState().getEntry('expired-key', 24)

    expect(miss).toBeNull()
    expect(useTmdbMatchCacheStore.getState().entries['expired-key']).toBeUndefined()
  })

  it('clearEntries 会清空所有缓存', () => {
    const store = useTmdbMatchCacheStore.getState()

    store.setEntry('k1', {
      searchedKeyword: 'a',
      candidates: [],
      movieSourceMatches: [],
      seasonSourceMatches: [],
    })
    store.setEntry('k2', {
      searchedKeyword: 'b',
      candidates: [],
      movieSourceMatches: [],
      seasonSourceMatches: [],
    })

    store.clearEntries()

    expect(useTmdbMatchCacheStore.getState().entries).toEqual({})
  })

  it('prune 在超过上限时保留最新条目', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

    const store = useTmdbMatchCacheStore.getState()
    store.setEntry('k1', {
      searchedKeyword: '1',
      candidates: [],
      movieSourceMatches: [],
      seasonSourceMatches: [],
    })

    vi.setSystemTime(new Date('2026-01-01T00:01:00.000Z'))
    store.setEntry('k2', {
      searchedKeyword: '2',
      candidates: [],
      movieSourceMatches: [],
      seasonSourceMatches: [],
    })

    vi.setSystemTime(new Date('2026-01-01T00:02:00.000Z'))
    store.setEntry('k3', {
      searchedKeyword: '3',
      candidates: [],
      movieSourceMatches: [],
      seasonSourceMatches: [],
    })

    store.prune(2)

    const keys = Object.keys(useTmdbMatchCacheStore.getState().entries)
    expect(keys).toHaveLength(2)
    expect(keys).toContain('k2')
    expect(keys).toContain('k3')
    expect(keys).not.toContain('k1')
  })
})
