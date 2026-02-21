export interface MobileGestureRuntimeConfig {
  edgeGuardRatio: number
  edgeGuardMinPx: number
  gestureActivationPx: number
  seekSecondsPer100Px: number
  volumeFullRangeSwipeRatio: number
  volumeSideZoneRatio: number
  doubleTapSideZoneRatio: number
  doubleTapSeekSeconds: number
  doubleTapWindowMs: number
  longPressDurationMs: number
  longPressPlaybackRate: number
}

export const MOBILE_GESTURE_BALANCED_CONFIG: MobileGestureRuntimeConfig = {
  edgeGuardRatio: 0,
  edgeGuardMinPx: 0,
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

export const getEdgeGuardSize = (viewportWidth: number, ratio: number, minPx: number): number => {
  if (viewportWidth <= 0) return minPx
  return Math.max(minPx, Math.round(viewportWidth * ratio))
}

export const isPointInGestureSafeArea = (x: number, width: number, edgeGuardPx: number): boolean => {
  if (width <= 0) return false
  return x > edgeGuardPx && x < width - edgeGuardPx
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
