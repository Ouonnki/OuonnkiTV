import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { HistoryHeader } from './HistoryHeader'

describe('history mobile action targets', () => {
  it.each([false, true])(
    'allows header wrapping and larger touch targets: editing=%s',
    selectionMode => {
      const container = document.createElement('div')
      container.innerHTML = renderToStaticMarkup(
        createElement(HistoryHeader, {
          totalCount: 100,
          hasHistory: true,
          selectionMode,
          onToggleSelectionMode: vi.fn(),
        }),
      )
      expect(container.querySelector('header > div')?.classList.contains('flex-wrap')).toBe(true)
      for (const button of container.querySelectorAll('button')) {
        expect(button.classList.contains('h-11')).toBe(true)
        expect(button.classList.contains('min-w-11')).toBe(true)
        expect(button.classList.contains('md:h-8')).toBe(true)
      }
    },
  )
})
