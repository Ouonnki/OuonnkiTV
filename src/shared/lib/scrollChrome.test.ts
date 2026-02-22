import { describe, expect, it } from 'vitest'
import { computeNextScrollChromeState } from './scrollChrome'

describe('computeNextScrollChromeState', () => {
  it('滚动位置回到顶部阈值内时强制显示导航', () => {
    const result = computeNextScrollChromeState({
      currentScrollTop: 6,
      lastScrollTop: 18,
      anchorScrollTop: 18,
      isChromeVisible: false,
      direction: 'up',
      topRevealOffset: 8,
    })

    expect(result.nextIsChromeVisible).toBe(true)
    expect(result.nextAnchorScrollTop).toBe(6)
  })

  it('下滚位移未达到隐藏阈值时保持显示', () => {
    const result = computeNextScrollChromeState({
      currentScrollTop: 20,
      lastScrollTop: 12,
      anchorScrollTop: 0,
      isChromeVisible: true,
      direction: 'down',
      hideThreshold: 24,
    })

    expect(result.nextDirection).toBe('down')
    expect(result.nextIsChromeVisible).toBe(true)
  })

  it('下滚位移达到隐藏阈值时切换为隐藏', () => {
    const result = computeNextScrollChromeState({
      currentScrollTop: 26,
      lastScrollTop: 20,
      anchorScrollTop: 0,
      isChromeVisible: true,
      direction: 'down',
      hideThreshold: 24,
    })

    expect(result.nextIsChromeVisible).toBe(false)
  })

  it('上滚位移未达到显示阈值时保持隐藏', () => {
    const result = computeNextScrollChromeState({
      currentScrollTop: 110,
      lastScrollTop: 120,
      anchorScrollTop: 124,
      isChromeVisible: false,
      direction: 'up',
      showThreshold: 16,
    })

    expect(result.nextDirection).toBe('up')
    expect(result.nextIsChromeVisible).toBe(false)
  })

  it('上滚位移达到显示阈值时切换为显示', () => {
    const result = computeNextScrollChromeState({
      currentScrollTop: 102,
      lastScrollTop: 110,
      anchorScrollTop: 120,
      isChromeVisible: false,
      direction: 'up',
      showThreshold: 16,
    })

    expect(result.nextIsChromeVisible).toBe(true)
  })

  it('方向切换时重置锚点，避免跨方向累计误判', () => {
    const result = computeNextScrollChromeState({
      currentScrollTop: 35,
      lastScrollTop: 40,
      anchorScrollTop: 10,
      isChromeVisible: false,
      direction: 'down',
      showThreshold: 16,
    })

    expect(result.nextDirection).toBe('up')
    expect(result.nextAnchorScrollTop).toBe(35)
    expect(result.nextIsChromeVisible).toBe(false)
  })
})

