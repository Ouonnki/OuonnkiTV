import { describe, expect, it } from 'vitest'
import {
  MOBILE_GESTURE_BALANCED_CONFIG,
  computeSeekPreviewTime,
  computeVolumeFromSwipe,
  getEdgeGuardSize,
  isPointInGestureSafeArea,
  resolveDoubleTapAction,
  resolveGestureDirection,
  shouldHandleVolumeGesture,
} from './mobileGesture'

describe('mobileGesture', () => {
  it('按平衡档计算边缘留白，且最小值生效', () => {
    expect(getEdgeGuardSize(360, MOBILE_GESTURE_BALANCED_CONFIG.edgeGuardRatio, 24)).toBe(29)
    expect(getEdgeGuardSize(200, MOBILE_GESTURE_BALANCED_CONFIG.edgeGuardRatio, 24)).toBe(24)
  })

  it('边缘留白区域外才允许手势', () => {
    expect(isPointInGestureSafeArea(10, 360, 24)).toBe(false)
    expect(isPointInGestureSafeArea(180, 360, 24)).toBe(true)
    expect(isPointInGestureSafeArea(350, 360, 24)).toBe(false)
  })

  it('达到阈值后可判定水平或垂直手势方向', () => {
    expect(resolveGestureDirection(4, 5, 12)).toBeNull()
    expect(resolveGestureDirection(24, 8, 12)).toBe('horizontal')
    expect(resolveGestureDirection(7, 30, 12)).toBe('vertical')
  })

  it('水平滑动预览进度并自动钳制边界', () => {
    const plus = computeSeekPreviewTime(100, 200, 240, MOBILE_GESTURE_BALANCED_CONFIG.seekSecondsPer100Px)
    const minus = computeSeekPreviewTime(8, -300, 240, MOBILE_GESTURE_BALANCED_CONFIG.seekSecondsPer100Px)
    const max = computeSeekPreviewTime(235, 200, 240, MOBILE_GESTURE_BALANCED_CONFIG.seekSecondsPer100Px)

    expect(plus).toBe(124)
    expect(minus).toBe(0)
    expect(max).toBe(240)
  })

  it('垂直滑动调节音量并钳制 0~1', () => {
    const up = computeVolumeFromSwipe(0.5, -100, MOBILE_GESTURE_BALANCED_CONFIG.volumePer100Px)
    const down = computeVolumeFromSwipe(0.5, 100, MOBILE_GESTURE_BALANCED_CONFIG.volumePer100Px)
    const lowerBound = computeVolumeFromSwipe(0.05, 500, MOBILE_GESTURE_BALANCED_CONFIG.volumePer100Px)
    const upperBound = computeVolumeFromSwipe(0.95, -500, MOBILE_GESTURE_BALANCED_CONFIG.volumePer100Px)

    expect(up).toBeCloseTo(0.7, 6)
    expect(down).toBeCloseTo(0.3, 6)
    expect(lowerBound).toBe(0)
    expect(upperBound).toBe(1)
  })

  it('双击分区和右侧 70% 音量区判定正确', () => {
    expect(resolveDoubleTapAction(100, 360)).toBe('backward')
    expect(resolveDoubleTapAction(260, 360)).toBe('forward')

    expect(shouldHandleVolumeGesture(90, 360, MOBILE_GESTURE_BALANCED_CONFIG.rightVolumeZoneRatio)).toBe(false)
    expect(shouldHandleVolumeGesture(150, 360, MOBILE_GESTURE_BALANCED_CONFIG.rightVolumeZoneRatio)).toBe(true)
  })
})
