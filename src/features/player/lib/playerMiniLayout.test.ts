import { describe, expect, it } from 'vitest'
import { computeMiniPlayerRect } from './playerMiniLayout'

describe('computeMiniPlayerRect', () => {
  it('移动端使用固定小窗尺寸并位于右上区域', () => {
    const rect = computeMiniPlayerRect({
      viewportWidth: 390,
      viewportHeight: 844,
      currentWidth: 320,
      currentHeight: 180,
      isMobile: true,
      isTablet: false,
    })

    expect(rect.width).toBe(240)
    expect(rect.height).toBe(135)
    expect(rect.top).toBe(72)
    expect(rect.left).toBe(138)
  })

  it('桌面端保留当前尺寸并位于右下区域', () => {
    const rect = computeMiniPlayerRect({
      viewportWidth: 1440,
      viewportHeight: 900,
      currentWidth: 320,
      currentHeight: 180,
      isMobile: false,
      isTablet: false,
    })

    expect(rect.width).toBe(320)
    expect(rect.height).toBe(180)
    expect(rect.top).toBe(620)
    expect(rect.left).toBe(1070)
  })

  it('会对越界位置做钳制，避免小窗超出可视区', () => {
    const rect = computeMiniPlayerRect({
      viewportWidth: 260,
      viewportHeight: 180,
      currentWidth: 400,
      currentHeight: 260,
      isMobile: false,
      isTablet: false,
    })

    expect(rect.top).toBeGreaterThanOrEqual(8)
    expect(rect.left).toBeGreaterThanOrEqual(8)
  })
})
