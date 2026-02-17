import { describe, expect, it } from 'vitest'
import { normalizeSearchMode } from './searchMode'

describe('normalizeSearchMode', () => {
  it('非法值与空值都回退到 tmdb', () => {
    expect(normalizeSearchMode(null)).toBe('tmdb')
    expect(normalizeSearchMode(undefined)).toBe('tmdb')
    expect(normalizeSearchMode('unknown')).toBe('tmdb')
  })

  it('direct 保持为 direct', () => {
    expect(normalizeSearchMode('direct')).toBe('direct')
  })
})
