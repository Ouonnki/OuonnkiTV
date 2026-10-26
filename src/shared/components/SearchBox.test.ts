import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SearchBox from './SearchBox'

vi.mock('@/shared/hooks', () => ({
  useSearch: () => ({ search: '', searchMovie: vi.fn() }),
  useSearchHistory: () => ({ searchHistory: [], removeSearchHistoryItem: vi.fn() }),
  useSearchSuggestions: () => ({
    suggestions: [],
    isLoading: false,
    fetchSuggestions: vi.fn(),
    clearSuggestions: vi.fn(),
  }),
}))

afterEach(() => vi.unstubAllGlobals())

describe('mobile navbar search focus', () => {
  it('keeps hidden controls out of the focus order when opening and closing', () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)
    try {
      act(() => root.render(createElement(SearchBox)))
      const trigger = container.querySelector<HTMLButtonElement>('[aria-label="打开搜索"]')!
      const close = container.querySelector<HTMLButtonElement>('[aria-label="关闭搜索"]')!
      const input = container.querySelectorAll<HTMLInputElement>('input[placeholder="搜索"]')[1]
      expect(input.closest('[inert]')).not.toBeNull()
      expect(close.closest('[inert]')).not.toBeNull()
      act(() => trigger.click())
      expect(input.closest('[inert]')).toBeNull()
      expect(close.closest('[inert]')).toBeNull()
      expect(document.activeElement).toBe(input)
      expect(trigger.hasAttribute('inert')).toBe(true)
      act(() => close.click())
      expect(input.closest('[inert]')).not.toBeNull()
      expect(trigger.hasAttribute('inert')).toBe(false)
    } finally {
      act(() => root.unmount())
      container.remove()
    }
  })
})
