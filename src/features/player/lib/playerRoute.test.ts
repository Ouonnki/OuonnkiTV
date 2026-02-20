import { describe, expect, it } from 'vitest'
import { buildTmdbPlayPath } from '@/shared/lib/routes'
import { INVALID_PLAYER_ROUTE_MESSAGE, validatePlayerRoute } from './playerRoute'

describe('validatePlayerRoute', () => {
  it('TMDB 路由参数合法时返回 tmdb 模式', () => {
    const result = validatePlayerRoute({
      type: 'tv',
      tmdbId: '1399',
    })

    expect(result.isValid).toBe(true)
    if (result.isValid) {
      expect(result.mode).toBe('tmdb')
      if (result.mode === 'tmdb') {
        expect(result.tmdbMediaType).toBe('tv')
        expect(result.tmdbId).toBe(1399)
      }
    }
  })

  it('非法 type 会判定为无效路由', () => {
    const result = validatePlayerRoute({
      type: 'anime',
      tmdbId: '1399',
    })

    expect(result).toEqual({
      isValid: false,
      mode: 'invalid',
      message: INVALID_PLAYER_ROUTE_MESSAGE,
    })
  })

  it('非法 tmdbId 会判定为无效路由', () => {
    const result = validatePlayerRoute({
      type: 'tv',
      tmdbId: 'abc',
    })

    expect(result).toEqual({
      isValid: false,
      mode: 'invalid',
      message: INVALID_PLAYER_ROUTE_MESSAGE,
    })
  })

  it('CMS 路由参数合法时返回 cms 模式', () => {
    const result = validatePlayerRoute({
      sourceCode: 'source-a',
      vodId: 'vod-1',
    })

    expect(result.isValid).toBe(true)
    if (result.isValid) {
      expect(result.mode).toBe('cms')
    }
  })

  it('切源/换季路径参数应完整生成', () => {
    const path = buildTmdbPlayPath('tv', 1399, {
      sourceCode: 'source-a',
      vodId: 'vod-1',
      episodeIndex: 5,
      seasonNumber: 2,
    })

    expect(path).toBe('/play/tv/1399?source=source-a&id=vod-1&ep=5&season=2')
  })
})
