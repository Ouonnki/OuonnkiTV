export interface MobileGestureRuntimeConfig {
  /** 手势激活所需的最小滑动距离（像素） */
  gestureActivationPx: number
  /** 每 100px 水平滑动对应的 seek 秒数 */
  seekSecondsPer100Px: number
  /** 音量全程滑动占屏幕高度的比例 */
  volumeFullRangeSwipeRatio: number
  /** 屏幕两侧用于触发音量调节的区域宽度比例 */
  volumeSideZoneRatio: number
  /** 屏幕两侧用于双击快进/后退的区域宽度比例 */
  doubleTapSideZoneRatio: number
  /** 双击快进/后退的秒数 */
  doubleTapSeekSeconds: number
  /** 双击判定时间窗口（毫秒） */
  doubleTapWindowMs: number
  /** 长按判定阈值（毫秒） */
  longPressDurationMs: number
  /** 长按加速播放倍速 */
  longPressPlaybackRate: number
}

export const MOBILE_GESTURE_BALANCED_CONFIG: MobileGestureRuntimeConfig = {
  gestureActivationPx: 12,
  seekSecondsPer100Px: 12,
  volumeFullRangeSwipeRatio: 0.9,
  volumeSideZoneRatio: 0.32,
  doubleTapSideZoneRatio: 0.22,
  doubleTapSeekSeconds: 10,
  doubleTapWindowMs: 280,
  longPressDurationMs: 380,
  longPressPlaybackRate: 2,
}

export type MobileGestureDirection = 'horizontal' | 'vertical'

export const clampValue = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value))
}

export const resolveGestureDirection = (
  deltaX: number,
  deltaY: number,
  activationThreshold: number,
): MobileGestureDirection | null => {
  const absX = Math.abs(deltaX)
  const absY = Math.abs(deltaY)

  if (absX < activationThreshold && absY < activationThreshold) {
    return null
  }

  return absX >= absY ? 'horizontal' : 'vertical'
}

export const shouldHandleVolumeGesture = (
  x: number,
  width: number,
  sideZoneRatio: number,
): boolean => {
  if (width <= 0) return false
  const sideZoneWidth = width * sideZoneRatio
  return x <= sideZoneWidth || x >= width - sideZoneWidth
}

export const computeSeekPreviewTime = (
  startTime: number,
  deltaX: number,
  duration: number,
  seekSecondsPer100Px: number,
): number => {
  const offset = (deltaX / 100) * seekSecondsPer100Px
  const maxDuration = Number.isFinite(duration) && duration > 0 ? duration : Number.MAX_SAFE_INTEGER
  return clampValue(startTime + offset, 0, maxDuration)
}

export const computeVolumeFromSwipe = (
  startVolume: number,
  deltaY: number,
  playerHeight: number,
  fullRangeSwipeRatio: number,
): number => {
  const effectiveHeight = Math.max(1, playerHeight * fullRangeSwipeRatio)
  const offset = -deltaY / effectiveHeight
  return clampValue(startVolume + offset, 0, 1)
}

export type DoubleTapAction = 'backward' | 'forward' | 'toggle'

export const resolveDoubleTapAction = (
  x: number,
  width: number,
  sideZoneRatio: number,
): DoubleTapAction => {
  const safeWidth = Math.max(1, width)
  const sideZoneWidth = safeWidth * sideZoneRatio
  if (x <= sideZoneWidth) return 'backward'
  if (x >= safeWidth - sideZoneWidth) return 'forward'
  return 'toggle'
}
