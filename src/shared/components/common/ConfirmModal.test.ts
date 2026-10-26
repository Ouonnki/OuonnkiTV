import { act, createElement, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmModal } from './ConfirmModal'

describe('shared destructive confirmation', () => {
  it.each(['取消', '确认'])(
    'requires an explicit decision and only applies confirmed changes: %s',
    action => {
      vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
      const container = document.createElement('div')
      document.body.append(container)
      const root = createRoot(container)
      const onConfirm = vi.fn(),
        onClose = vi.fn()
      function Example() {
        const [open, setOpen] = useState(true)
        return createElement(ConfirmModal, {
          isOpen: open,
          onClose: () => {
            onClose()
            setOpen(false)
          },
          onConfirm,
          title: '确认删除',
          description: '无法撤销',
          isDestructive: true,
        })
      }
      try {
        act(() => root.render(createElement(Example)))
        const dialog = document.querySelector('[role="alertdialog"]')!
        expect(dialog.getAttribute('aria-describedby')).toBeTruthy()
        expect(dialog.querySelector('[data-slot="alert-dialog-media"]')).not.toBeNull()
        expect(onConfirm).not.toHaveBeenCalled()
        const button = [...dialog.querySelectorAll('button')].find(
          button => button.textContent === action,
        )!
        act(() => button.click())
        expect(onConfirm).toHaveBeenCalledTimes(action === '确认' ? 1 : 0)
        expect(onClose).toHaveBeenCalledOnce()
        expect(document.querySelector('[role="alertdialog"]')).toBeNull()
      } finally {
        act(() => root.unmount())
        container.remove()
        vi.unstubAllGlobals()
      }
    },
  )
})
