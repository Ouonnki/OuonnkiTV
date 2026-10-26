import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import { SearchHistoryDeleteButton } from './SearchHistoryDeleteButton'

describe('search history deletion affordance', () => {
  it('is touch-visible, keyboard-visible and does not activate the history row', () => {
    const container = document.createElement('div')
    const root = createRoot(container)
    const onDelete = vi.fn(),
      onRowClick = vi.fn(),
      onRowKey = vi.fn()
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
    try {
      act(() =>
        root.render(
          createElement(
            'div',
            { onClick: onRowClick, onKeyDown: onRowKey },
            createElement(SearchHistoryDeleteButton, { content: '测试搜索', onDelete }),
          ),
        ),
      )
      const button = container.querySelector('button')!
      expect(button.getAttribute('aria-label')).toBe('删除搜索历史：测试搜索')
      expect(button.classList.contains('opacity-100')).toBe(true)
      expect(button.classList.contains('[@media(hover:hover)_and_(pointer:fine)]:opacity-0')).toBe(
        true,
      )
      expect(button.classList.contains('group-focus-within:opacity-100')).toBe(true)
      act(() => {
        button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        button.click()
      })
      expect(onDelete).toHaveBeenCalledOnce()
      expect(onRowClick).not.toHaveBeenCalled()
      expect(onRowKey).not.toHaveBeenCalled()
    } finally {
      act(() => root.unmount())
      vi.unstubAllGlobals()
    }
  })
})
