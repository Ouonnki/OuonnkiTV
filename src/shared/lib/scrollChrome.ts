export type ScrollChromeDirection = 'up' | 'down' | 'none'

export interface ScrollChromeTransitionInput {
  currentScrollTop: number
  lastScrollTop: number
  anchorScrollTop: number
  isChromeVisible: boolean
  direction: ScrollChromeDirection
  hideThreshold?: number
  showThreshold?: number
  topRevealOffset?: number
}

export interface ScrollChromeTransitionOutput {
  nextIsChromeVisible: boolean
  nextDirection: ScrollChromeDirection
  nextAnchorScrollTop: number
  nextLastScrollTop: number
}

const DEFAULT_HIDE_THRESHOLD = 24
const DEFAULT_SHOW_THRESHOLD = 16
const DEFAULT_TOP_REVEAL_OFFSET = 8

const normalizeScrollTop = (value: number) => Math.max(0, value)

/**
 * 计算滚动驱动的导航显隐状态。
 * 规则：
 * 1. 顶部区域内强制显示；
 * 2. 下滚累计超过阈值后隐藏；
 * 3. 上滚累计超过阈值后显示；
 * 4. 方向切换时重置锚点，避免跨方向累计误判。
 */
export function computeNextScrollChromeState(
  input: ScrollChromeTransitionInput,
): ScrollChromeTransitionOutput {
  const currentScrollTop = normalizeScrollTop(input.currentScrollTop)
  const lastScrollTop = normalizeScrollTop(input.lastScrollTop)
  const hideThreshold = input.hideThreshold ?? DEFAULT_HIDE_THRESHOLD
  const showThreshold = input.showThreshold ?? DEFAULT_SHOW_THRESHOLD
  const topRevealOffset = input.topRevealOffset ?? DEFAULT_TOP_REVEAL_OFFSET

  const delta = currentScrollTop - lastScrollTop
  let nextDirection: ScrollChromeDirection = input.direction
  if (delta > 0) {
    nextDirection = 'down'
  } else if (delta < 0) {
    nextDirection = 'up'
  }

  if (currentScrollTop <= topRevealOffset) {
    return {
      nextIsChromeVisible: true,
      nextDirection,
      nextAnchorScrollTop: currentScrollTop,
      nextLastScrollTop: currentScrollTop,
    }
  }

  let nextAnchorScrollTop = normalizeScrollTop(input.anchorScrollTop)
  if (nextDirection !== input.direction && delta !== 0) {
    nextAnchorScrollTop = currentScrollTop
  }

  let nextIsChromeVisible = input.isChromeVisible

  if (nextDirection === 'down' && nextIsChromeVisible) {
    if (currentScrollTop - nextAnchorScrollTop >= hideThreshold) {
      nextIsChromeVisible = false
    }
  } else if (nextDirection === 'up' && !nextIsChromeVisible) {
    if (nextAnchorScrollTop - currentScrollTop >= showThreshold) {
      nextIsChromeVisible = true
    }
  }

  return {
    nextIsChromeVisible,
    nextDirection,
    nextAnchorScrollTop,
    nextLastScrollTop: currentScrollTop,
  }
}

