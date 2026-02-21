import { describe, expect, it } from 'vitest'
import {
  MOBILE_GESTURE_BALANCED_CONFIG,
  computeSeekPreviewTime,
  computeVolumeFromSwipe,
  resolveDoubleTapAction,
  resolveGestureDirection,
  shouldHandleVolumeGesture,
} from './mobileGesture'

describe('mobileGesture', () => {
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
    const up = computeVolumeFromSwipe(
      0.5,
      -180,
      360,
      MOBILE_GESTURE_BALANCED_CONFIG.volumeFullRangeSwipeRatio,
    )
    const down = computeVolumeFromSwipe(
      0.5,
      180,
      360,
      MOBILE_GESTURE_BALANCED_CONFIG.volumeFullRangeSwipeRatio,
    )
    const lowerBound = computeVolumeFromSwipe(
      0.05,
      500,
      360,
      MOBILE_GESTURE_BALANCED_CONFIG.volumeFullRangeSwipeRatio,
    )
    const upperBound = computeVolumeFromSwipe(
      0.95,
      -500,
      360,
      MOBILE_GESTURE_BALANCED_CONFIG.volumeFullRangeSwipeRatio,
    )

    expect(up).toBeCloseTo(1, 6)
    expect(down).toBeCloseTo(0, 6)
    expect(lowerBound).toBe(0)
    expect(upperBound).toBe(1)
  })

  it('双击分区和两侧音量区判定正确', () => {
    expect(resolveDoubleTapAction(60, 360, MOBILE_GESTURE_BALANCED_CONFIG.doubleTapSideZoneRatio)).toBe(
      'backward',
    )
    expect(resolveDoubleTapAction(180, 360, MOBILE_GESTURE_BALANCED_CONFIG.doubleTapSideZoneRatio)).toBe(
      'toggle',
    )
    expect(resolveDoubleTapAction(320, 360, MOBILE_GESTURE_BALANCED_CONFIG.doubleTapSideZoneRatio)).toBe(
      'forward',
    )

    expect(shouldHandleVolumeGesture(80, 360, MOBILE_GESTURE_BALANCED_CONFIG.volumeSideZoneRatio)).toBe(true)
    expect(shouldHandleVolumeGesture(180, 360, MOBILE_GESTURE_BALANCED_CONFIG.volumeSideZoneRatio)).toBe(false)
    expect(shouldHandleVolumeGesture(300, 360, MOBILE_GESTURE_BALANCED_CONFIG.volumeSideZoneRatio)).toBe(true)
  })
})
