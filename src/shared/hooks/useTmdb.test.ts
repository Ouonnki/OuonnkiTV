import { describe, expect, it } from 'vitest'
import { selectRecommendationSource } from './useTmdb'

describe('selectRecommendationSource', () => {
  it('候选为空时返回 null', () => {
    const selected = selectRecommendationSource(null, [])
    expect(selected).toBeNull()
  })

  it('上一次来源仍在候选中时优先复用，避免重渲染抖动', () => {
    const previous = { id: 100, mediaType: 'movie' as const }
    const candidates = [
      { id: 200, mediaType: 'tv' as const },
      { id: 100, mediaType: 'movie' as const },
    ]

    const selected = selectRecommendationSource(previous, candidates, () => 0)

    expect(selected).toBe(previous)
  })

  it('上一次来源不存在时按随机索引选择', () => {
    const candidates = [
      { id: 1, mediaType: 'movie' as const },
      { id: 2, mediaType: 'tv' as const },
    ]

    const selected = selectRecommendationSource(null, candidates, () => 0.75)

    expect(selected).toEqual({ id: 2, mediaType: 'tv' })
  })
})
