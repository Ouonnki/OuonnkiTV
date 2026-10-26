import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import { ChangelogDialog } from './ChangelogDialog'
import type { VersionUpdate } from '@/shared/store/versionStore'

const viewport = vi.hoisted(() => ({ mobile: false }))
vi.mock('@/shared/hooks/use-mobile', () => ({ useIsMobile: () => viewport.mobile }))

const versions: VersionUpdate[] = [
  {
    version: '2',
    title: '新版',
    date: '2026-01-02',
    features: ['新增功能'],
    fixes: ['修复问题'],
    breaking: ['重要变化'],
  },
  { version: '1', title: '旧版', date: '2026-01-01', features: ['初始功能'] },
]

describe('changelog visual structure and navigation', () => {
  it.each([false, true])(
    'keeps content readable and version controls usable: mobile=%s',
    mobile => {
      viewport.mobile = mobile
      vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
      vi.stubGlobal(
        'ResizeObserver',
        class {
          observe = vi.fn()
          unobserve = vi.fn()
          disconnect = vi.fn()
        },
      )
      const container = document.createElement('div')
      document.body.append(container)
      const root = createRoot(container)
      try {
        act(() =>
          root.render(createElement(ChangelogDialog, { isOpen: true, onClose: vi.fn(), versions })),
        )
        const dialog = document.querySelector('[role="dialog"]')!
        expect(dialog.getAttribute('aria-describedby')).toBeTruthy()
        expect(dialog.classList.contains('bg-popover')).toBe(true)
        expect(dialog.classList.contains('backdrop-blur-xl')).toBe(false)
        expect(dialog.querySelectorAll('section[aria-label]')).toHaveLength(3)
        const sections = [...dialog.querySelectorAll('section[aria-label]')]
        expect(sections.map(section => section.getAttribute('aria-label'))).toEqual([
          '新功能',
          '问题修复',
          '重要变更',
        ])
        for (const section of sections) {
          expect(section.classList.contains('border-t')).toBe(true)
          expect(section.querySelector('.bg-gradient-to-r')).toBeNull()
        }
        const old = [...dialog.querySelectorAll('button')].find(button =>
          button.textContent?.includes('旧版'),
        )!
        act(() => old.click())
        expect(old.getAttribute(mobile ? 'aria-expanded' : 'aria-pressed')).toBe('true')
      } finally {
        act(() => root.unmount())
        container.remove()
        vi.unstubAllGlobals()
      }
    },
  )
})
