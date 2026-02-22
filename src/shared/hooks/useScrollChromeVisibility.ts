import { useEffect, useRef, useState } from 'react'
import {
  computeNextScrollChromeState,
  type ScrollChromeDirection,
} from '@/shared/lib/scrollChrome'

interface UseScrollChromeVisibilityOptions {
  scrollRootSelector?: string
  resetKey?: string
  hideThreshold?: number
  showThreshold?: number
  topRevealOffset?: number
}

interface ScrollChromeStateRef {
  lastScrollTop: number
  anchorScrollTop: number
  direction: ScrollChromeDirection
  isChromeVisible: boolean
}

const DEFAULT_SCROLL_ROOT_SELECTOR = '[data-main-scroll-area]'
const SCROLL_VIEWPORT_SELECTOR = '[data-slot="scroll-area-viewport"]'

/**
 * 监听主滚动容器，输出导航栏/侧栏显隐状态。
 */
export function useScrollChromeVisibility({
  scrollRootSelector = DEFAULT_SCROLL_ROOT_SELECTOR,
  resetKey,
  hideThreshold,
  showThreshold,
  topRevealOffset,
}: UseScrollChromeVisibilityOptions = {}) {
  const [isChromeVisible, setIsChromeVisible] = useState(true)
  const stateRef = useRef<ScrollChromeStateRef>({
    lastScrollTop: 0,
    anchorScrollTop: 0,
    direction: 'none',
    isChromeVisible: true,
  })

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(scrollRootSelector)
    const viewport = root?.querySelector<HTMLElement>(SCROLL_VIEWPORT_SELECTOR)

    if (!viewport) {
      setIsChromeVisible(true)
      return
    }

    const initialScrollTop = Math.max(0, viewport.scrollTop)
    stateRef.current = {
      lastScrollTop: initialScrollTop,
      anchorScrollTop: initialScrollTop,
      direction: 'none',
      isChromeVisible: true,
    }
    setIsChromeVisible(true)

    const handleScroll = () => {
      const currentState = stateRef.current
      const next = computeNextScrollChromeState({
        currentScrollTop: viewport.scrollTop,
        lastScrollTop: currentState.lastScrollTop,
        anchorScrollTop: currentState.anchorScrollTop,
        isChromeVisible: currentState.isChromeVisible,
        direction: currentState.direction,
        hideThreshold,
        showThreshold,
        topRevealOffset,
      })

      stateRef.current = {
        lastScrollTop: next.nextLastScrollTop,
        anchorScrollTop: next.nextAnchorScrollTop,
        direction: next.nextDirection,
        isChromeVisible: next.nextIsChromeVisible,
      }

      if (currentState.isChromeVisible !== next.nextIsChromeVisible) {
        setIsChromeVisible(next.nextIsChromeVisible)
      }
    }

    viewport.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      viewport.removeEventListener('scroll', handleScroll)
    }
  }, [scrollRootSelector, resetKey, hideThreshold, showThreshold, topRevealOffset])

  return isChromeVisible
}

