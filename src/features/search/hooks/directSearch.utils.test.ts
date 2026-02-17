import { describe, expect, it } from 'vitest'
import type { VideoSource } from '@ouonnki/cms-core'
import { getSourcesToFetch } from './directSearch.utils'

function createSource(id: string): VideoSource {
  return {
    id,
    name: id,
    url: `https://example.com/${id}`,
    detailUrl: `https://example.com/${id}`,
    isEnabled: true,
    updatedAt: new Date(),
    timeout: 5000,
    retry: 1,
  }
}

describe('getSourcesToFetch', () => {
  it('无缓存时返回全部启用源', () => {
    const selectedAPIs = [createSource('a'), createSource('b')]
    const result = getSourcesToFetch(selectedAPIs, new Map(), 2)

    expect(result.map(item => item.id)).toEqual(['a', 'b'])
  })

  it('页码超出缓存总页数时跳过该源', () => {
    const selectedAPIs = [createSource('a'), createSource('b'), createSource('c')]
    const cache = new Map([
      ['a', { totalPages: 1, totalResults: 10 }],
      ['b', { totalPages: 3, totalResults: 20 }],
    ])

    const result = getSourcesToFetch(selectedAPIs, cache, 2)

    expect(result.map(item => item.id)).toEqual(['b', 'c'])
    expect(result).toHaveLength(2)
  })
})
