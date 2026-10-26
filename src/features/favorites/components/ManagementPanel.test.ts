import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ManagementPanel } from './ManagementPanel'

function renderPanel(selectedCount: number) {
  const container = document.createElement('div')
  container.innerHTML = renderToStaticMarkup(
    createElement(ManagementPanel, {
      isOpen: true,
      selectedCount,
      totalCount: 100,
      isAllSelected: selectedCount === 100,
      onExit: vi.fn(),
      onSelectAll: vi.fn(),
      onDeselectAll: vi.fn(),
      onClearAll: vi.fn(),
      onDeleteSelected: vi.fn(),
    }),
  )
  return container
}

describe('favorites batch toolbar', () => {
  it('separates count and completion from a responsive action grid', () => {
    const panel = renderPanel(100)
    expect(panel.querySelector('[role="status"]')?.textContent).toContain('100/100')
    const done = [...panel.querySelectorAll('button')].find(
      button => button.textContent === '完成',
    )!
    expect(done.classList.contains('h-11')).toBe(true)
    const grid = panel.querySelector('.grid-cols-3')!
    expect(grid.querySelectorAll('button')).toHaveLength(3)
    expect(grid.textContent).not.toContain('100/100')
    expect(grid.textContent).not.toContain('完成')
    expect(panel.querySelector('.overflow-hidden')).toBeNull()
    expect(panel.firstElementChild?.classList.contains('md:left-1/2')).toBe(true)
    expect(panel.firstElementChild?.classList.contains('md:-translate-x-1/2')).toBe(true)
  })

  it('disables deletion when the selection is empty', () => {
    const button = renderPanel(0).querySelector<HTMLButtonElement>(
      '[aria-label="删除选中的 0 个收藏"]',
    )!
    expect(button.disabled).toBe(true)
  })
})
