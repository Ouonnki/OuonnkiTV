import { describe, expect, it } from 'vitest'
import {
  buildTmdbSelectionScopeKey,
  getNextTmdbSelectionLock,
  resolvePlayerSelection,
  type TmdbSelectionLock,
} from './playerSelection'

describe('buildTmdbSelectionScopeKey', () => {
  it('TV 路由包含季编号作用域', () => {
    expect(buildTmdbSelectionScopeKey('tv', 1399, 2)).toBe('tv:1399:2')
  })

  it('非法 TMDB 参数返回空作用域', () => {
    expect(buildTmdbSelectionScopeKey(null, 1399, null)).toBe('')
    expect(buildTmdbSelectionScopeKey('movie', 0, null)).toBe('')
  })
})

describe('resolvePlayerSelection', () => {
  it('CMS 路由优先使用路径参数', () => {
    const result = resolvePlayerSelection({
      isCmsRoute: true,
      isTmdbRoute: false,
      routeSourceCode: 'cms-a',
      routeVodId: 'vod-a',
      querySourceCode: '',
      queryVodId: '',
      tmdbResolvedSourceCode: 'tmdb-a',
      tmdbResolvedVodId: 'tmdb-vod-a',
      currentScopeKey: 'tv:1399:1',
      lock: null,
    })

    expect(result).toEqual({
      resolvedSourceCode: 'cms-a',
      resolvedVodId: 'vod-a',
      hasExplicitTmdbSelection: false,
    })
  })

  it('TMDB 路由有显式 query 时优先 query', () => {
    const result = resolvePlayerSelection({
      isCmsRoute: false,
      isTmdbRoute: true,
      routeSourceCode: '',
      routeVodId: '',
      querySourceCode: 'source-b',
      queryVodId: 'vod-b',
      tmdbResolvedSourceCode: 'source-a',
      tmdbResolvedVodId: 'vod-a',
      currentScopeKey: 'tv:1399:1',
      lock: {
        scopeKey: 'tv:1399:1',
        sourceCode: 'source-lock',
        vodId: 'vod-lock',
      },
    })

    expect(result).toEqual({
      resolvedSourceCode: 'source-b',
      resolvedVodId: 'vod-b',
      hasExplicitTmdbSelection: true,
    })
  })

  it('同 scope 下优先使用已锁定源，避免重排覆盖', () => {
    const lock: TmdbSelectionLock = {
      scopeKey: 'tv:1399:1',
      sourceCode: 'source-lock',
      vodId: 'vod-lock',
    }

    const result = resolvePlayerSelection({
      isCmsRoute: false,
      isTmdbRoute: true,
      routeSourceCode: '',
      routeVodId: '',
      querySourceCode: '',
      queryVodId: '',
      tmdbResolvedSourceCode: 'source-new-first',
      tmdbResolvedVodId: 'vod-new-first',
      currentScopeKey: 'tv:1399:1',
      lock,
    })

    expect(result).toEqual({
      resolvedSourceCode: 'source-lock',
      resolvedVodId: 'vod-lock',
      hasExplicitTmdbSelection: false,
    })
  })
})

describe('getNextTmdbSelectionLock', () => {
  it('query 明确指定源时更新锁', () => {
    const next = getNextTmdbSelectionLock({
      isTmdbRoute: true,
      currentScopeKey: 'tv:1399:1',
      querySourceCode: 'source-b',
      queryVodId: 'vod-b',
      tmdbResolvedSourceCode: 'source-a',
      tmdbResolvedVodId: 'vod-a',
      lock: null,
    })

    expect(next).toEqual({
      scopeKey: 'tv:1399:1',
      sourceCode: 'source-b',
      vodId: 'vod-b',
    })
  })

  it('scope 变化后旧锁失效，并用新 fallback 重建', () => {
    const next = getNextTmdbSelectionLock({
      isTmdbRoute: true,
      currentScopeKey: 'tv:1399:2',
      querySourceCode: '',
      queryVodId: '',
      tmdbResolvedSourceCode: 'source-new',
      tmdbResolvedVodId: 'vod-new',
      lock: {
        scopeKey: 'tv:1399:1',
        sourceCode: 'source-old',
        vodId: 'vod-old',
      },
    })

    expect(next).toEqual({
      scopeKey: 'tv:1399:2',
      sourceCode: 'source-new',
      vodId: 'vod-new',
    })
  })
})
