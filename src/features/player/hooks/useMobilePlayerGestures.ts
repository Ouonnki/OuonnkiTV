import { useEffect, useMemo, useRef } from 'react'
import type Artplayer from 'artplayer'
import {
  MOBILE_GESTURE_BALANCED_CONFIG,
  clampValue,
  computeSeekPreviewTime,
  computeVolumeFromSwipe,
  getEdgeGuardSize,
  isPointInGestureSafeArea,
  resolveDoubleTapAction,
  resolveGestureDirection,
  shouldHandleVolumeGesture,
  type MobileGestureRuntimeConfig,
} from '@/features/player/lib/mobileGesture'

interface UseMobilePlayerGesturesParams {
  art: Artplayer | null
  enabled: boolean
  config?: Partial<MobileGestureRuntimeConfig>
  onVolumeGestureChange?: (volume: number) => void
  onVolumeGestureEnd?: () => void
}

type GestureAxis = 'horizontal' | 'vertical' | 'blocked' | null

interface GestureSession {
  pointerId: number
  startX: number
  startY: number
  startTime: number
  startVolume: number
  playerWidth: number
  playerHeight: number
  axis: GestureAxis
  pendingSeekTime: number | null
  longPressTriggered: boolean
}

interface TapRecord {
  timestamp: number
  x: number
  y: number
}

const MOBILE_BREAKPOINT = 768
const TAP_MOVE_TOLERANCE = 12
const TAP_TIME_TOLERANCE = 320

const formatTime = (seconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(seconds))
  const mins = Math.floor(safeSeconds / 60)
  const secs = safeSeconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const isMobileViewport = () => window.innerWidth < MOBILE_BREAKPOINT

export function useMobilePlayerGestures({
  art,
  enabled,
  config,
  onVolumeGestureChange,
  onVolumeGestureEnd,
}: UseMobilePlayerGesturesParams) {
  const mergedConfig = useMemo<MobileGestureRuntimeConfig>(
    () => ({
      ...MOBILE_GESTURE_BALANCED_CONFIG,
      ...config,
    }),
    [config],
  )

  const sessionRef = useRef<GestureSession | null>(null)
  const longPressTimerRef = useRef<number | null>(null)
  const lastTapRef = useRef<TapRecord | null>(null)
  const lockStateRef = useRef(false)
  const playbackRateBeforeLongPressRef = useRef<number>(1)

  useEffect(() => {
    if (!art) return

    const clearLongPressTimer = () => {
      if (longPressTimerRef.current) {
        window.clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }
    }

    const restorePlaybackRate = () => {
      const session = sessionRef.current
      if (!session?.longPressTriggered) return
      art.playbackRate = clampValue(playbackRateBeforeLongPressRef.current, 0.1, 16)
      session.longPressTriggered = false
    }

    const resetSession = () => {
      if (sessionRef.current?.axis === 'vertical') {
        onVolumeGestureEnd?.()
      }
      clearLongPressTimer()
      restorePlaybackRate()
      sessionRef.current = null
    }

    const canHandleGesture = () => {
      return enabled && isMobileViewport() && (art.fullscreenWeb || art.fullscreen) && !lockStateRef.current
    }

    lockStateRef.current = art.isLock

    const onLock = (state: boolean) => {
      lockStateRef.current = state
      if (state) {
        resetSession()
      }
    }

    const onFullscreenWebChange = (state: boolean) => {
      if (!state) {
        resetSession()
      }
    }

    const onResize = () => {
      if (!canHandleGesture()) {
        resetSession()
      }
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') return
      if (!canHandleGesture()) return
      if (sessionRef.current) return

      const target = event.target as HTMLElement | null
      if (
        target &&
        (art.template.$controls.contains(target) ||
          art.template.$setting.contains(target) ||
          art.template.$contextmenu.contains(target))
      ) {
        return
      }

      const rect = art.template.$player.getBoundingClientRect()
      const localX = event.clientX - rect.left
      const localY = event.clientY - rect.top
      const edgeGuardPx = getEdgeGuardSize(rect.width, mergedConfig.edgeGuardRatio, mergedConfig.edgeGuardMinPx)

      if (!isPointInGestureSafeArea(localX, rect.width, edgeGuardPx)) {
        return
      }

      sessionRef.current = {
        pointerId: event.pointerId,
        startX: localX,
        startY: localY,
        startTime: art.currentTime || 0,
        startVolume: art.video.volume,
        playerWidth: rect.width,
        playerHeight: rect.height,
        axis: null,
        pendingSeekTime: null,
        longPressTriggered: false,
      }

      playbackRateBeforeLongPressRef.current = art.playbackRate || 1
      clearLongPressTimer()
      longPressTimerRef.current = window.setTimeout(() => {
        const current = sessionRef.current
        if (!current) return
        if (current.pointerId !== event.pointerId) return
        if (current.axis !== null) return
        if (!canHandleGesture()) return

        current.longPressTriggered = true
        art.playbackRate = mergedConfig.longPressPlaybackRate
      }, mergedConfig.longPressDurationMs)
    }

    const onPointerMove = (event: PointerEvent) => {
      const session = sessionRef.current
      if (!session) return
      if (session.pointerId !== event.pointerId) return

      const rect = art.template.$player.getBoundingClientRect()
      const localX = event.clientX - rect.left
      const localY = event.clientY - rect.top
      const deltaX = localX - session.startX
      const deltaY = localY - session.startY

      if (session.axis === null) {
        const direction = resolveGestureDirection(deltaX, deltaY, mergedConfig.gestureActivationPx)
        if (!direction) return

        if (direction === 'vertical') {
          const allowVolume = shouldHandleVolumeGesture(
            session.startX,
            session.playerWidth,
            mergedConfig.rightVolumeZoneRatio,
          )
          session.axis = allowVolume ? 'vertical' : 'blocked'
        } else {
          session.axis = 'horizontal'
        }
        clearLongPressTimer()
      }

      if (session.axis === 'horizontal') {
        const duration = Number.isFinite(art.duration) ? art.duration : Number.MAX_SAFE_INTEGER
        const previewTime = computeSeekPreviewTime(
          session.startTime,
          deltaX,
          duration,
          mergedConfig.seekSecondsPer100Px,
        )
        session.pendingSeekTime = previewTime
        art.notice.show = `预览 ${formatTime(previewTime)}`
        if (event.cancelable) {
          event.preventDefault()
        }
        return
      }

      if (session.axis === 'vertical') {
        const nextVolume = computeVolumeFromSwipe(
          session.startVolume,
          deltaY,
          session.playerHeight,
          mergedConfig.volumeFullRangeSwipeRatio,
        )
        if (Math.abs(nextVolume - art.video.volume) >= 0.005) {
          art.video.volume = nextVolume
          if (nextVolume > 0 && art.video.muted) {
            art.video.muted = false
          }
        }
        onVolumeGestureChange?.(nextVolume)
        if (event.cancelable) {
          event.preventDefault()
        }
      }
    }

    const onPointerEnd = (event: PointerEvent) => {
      const session = sessionRef.current
      if (!session) return
      if (session.pointerId !== event.pointerId) return

      clearLongPressTimer()

      if (session.longPressTriggered) {
        restorePlaybackRate()
        sessionRef.current = null
        return
      }

      if (session.axis === 'horizontal' && session.pendingSeekTime !== null) {
        art.seek = session.pendingSeekTime
        sessionRef.current = null
        return
      }

      if (session.axis === null) {
        const rect = art.template.$player.getBoundingClientRect()
        const localX = event.clientX - rect.left
        const localY = event.clientY - rect.top
        const now = Date.now()
        const lastTap = lastTapRef.current

        const isDoubleTap =
          Boolean(lastTap) &&
          now - (lastTap?.timestamp || 0) <= mergedConfig.doubleTapWindowMs &&
          Math.abs(localX - (lastTap?.x || 0)) <= TAP_MOVE_TOLERANCE &&
          Math.abs(localY - (lastTap?.y || 0)) <= TAP_MOVE_TOLERANCE

        if (isDoubleTap) {
          if (event.cancelable) {
            event.preventDefault()
          }
          const action = resolveDoubleTapAction(localX, rect.width, mergedConfig.doubleTapSideZoneRatio)
          if (action === 'forward') {
            art.forward = mergedConfig.doubleTapSeekSeconds
            art.notice.show = `快进 ${mergedConfig.doubleTapSeekSeconds} 秒`
          } else if (action === 'backward') {
            art.backward = mergedConfig.doubleTapSeekSeconds
            art.notice.show = `后退 ${mergedConfig.doubleTapSeekSeconds} 秒`
          } else {
            art.toggle()
          }
          lastTapRef.current = null
          sessionRef.current = null
          return
        }

        lastTapRef.current = {
          timestamp: now,
          x: localX,
          y: localY,
        }

        window.setTimeout(() => {
          const currentTap = lastTapRef.current
          if (!currentTap) return
          if (Date.now() - currentTap.timestamp >= TAP_TIME_TOLERANCE) {
            lastTapRef.current = null
          }
        }, TAP_TIME_TOLERANCE + 10)
      }

      if (session.axis === 'vertical') {
        onVolumeGestureEnd?.()
      }
      sessionRef.current = null
    }

    const onPointerCancel = (event: PointerEvent) => {
      const session = sessionRef.current
      if (!session) return
      if (session.pointerId !== event.pointerId) return
      resetSession()
    }

    art.template.$player.addEventListener('pointerdown', onPointerDown)
    art.template.$player.addEventListener('pointermove', onPointerMove, { passive: false })
    art.template.$player.addEventListener('pointerup', onPointerEnd)
    art.template.$player.addEventListener('pointercancel', onPointerCancel)

    art.on('lock', onLock)
    art.on('fullscreenWeb', onFullscreenWebChange)
    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('orientationchange', onResize)

    return () => {
      resetSession()
      art.template.$player.removeEventListener('pointerdown', onPointerDown)
      art.template.$player.removeEventListener('pointermove', onPointerMove)
      art.template.$player.removeEventListener('pointerup', onPointerEnd)
      art.template.$player.removeEventListener('pointercancel', onPointerCancel)
      art.off('lock', onLock)
      art.off('fullscreenWeb', onFullscreenWebChange)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [art, enabled, mergedConfig, onVolumeGestureChange, onVolumeGestureEnd])
}
