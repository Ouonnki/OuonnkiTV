import { useEffect, useMemo, useRef } from 'react'
import type Artplayer from 'artplayer'
import {
  MOBILE_GESTURE_BALANCED_CONFIG,
  clampValue,
  computeSeekPreviewTime,
  computeVolumeFromSwipe,
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
  onSeekGesturePreviewChange?: (previewTime: number) => void
  onSeekGesturePreviewEnd?: () => void
}

/** 手势方向：水平（seek）、垂直（音量）、null（未确定） */
type GestureAxis = 'horizontal' | 'vertical' | null

interface GestureSession {
  /** 跟踪的 touch identifier */
  touchId: number
  /** 起始坐标（相对于播放器） */
  startX: number
  startY: number
  /** 起始播放时间 */
  startTime: number
  /** 起始音量 */
  startVolume: number
  /** 播放器尺寸 */
  playerWidth: number
  playerHeight: number
  /** 已确定的手势方向 */
  axis: GestureAxis
  /** 水平滑动时待 seek 的目标时间 */
  pendingSeekTime: number | null
  /** 是否已触发长按加速 */
  longPressTriggered: boolean
}

interface TapRecord {
  timestamp: number
  x: number
  y: number
}

/** 单击判定：手指移动容差 */
const TAP_MOVE_TOLERANCE = 12
/** 双击判定：两次点击的最大间隔 */
const TAP_TIME_TOLERANCE = 320

const isTouchDevice = () =>
  window.matchMedia('(hover: none) and (pointer: coarse)').matches || navigator.maxTouchPoints > 0

export function useMobilePlayerGestures({
  art,
  enabled,
  config,
  onVolumeGestureChange,
  onVolumeGestureEnd,
  onSeekGesturePreviewChange,
  onSeekGesturePreviewEnd,
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
  const suppressClickUntilRef = useRef(0)

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
      if (sessionRef.current?.axis === 'horizontal') {
        onSeekGesturePreviewEnd?.()
      }
      clearLongPressTimer()
      restorePlaybackRate()
      sessionRef.current = null
    }

    const shouldIgnoreTarget = (target: EventTarget | null) => {
      const element = target as HTMLElement | null
      if (!element) return false

      return Boolean(
        element.closest(
          '.art-control, .art-progress, .art-setting, .art-contextmenu, .art-selector-list, .art-settings, button, [role="button"], input, select, textarea, label',
        ),
      )
    }

    const suppressFollowupClicks = (durationMs: number) => {
      suppressClickUntilRef.current = Date.now() + durationMs
    }

    const isFullscreenActive = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element | null }
      const video = art.video as HTMLVideoElement & {
        webkitDisplayingFullscreen?: boolean
        webkitPresentationMode?: string
      }

      return Boolean(
        art.fullscreenWeb ||
          art.fullscreen ||
          doc.fullscreenElement ||
          doc.webkitFullscreenElement ||
          video?.webkitDisplayingFullscreen ||
          video?.webkitPresentationMode === 'fullscreen',
      )
    }

    const canHandleGesture = () => {
      return enabled && isTouchDevice() && isFullscreenActive() && !lockStateRef.current
    }

    lockStateRef.current = art.isLock

    const onLock = (state: boolean) => {
      lockStateRef.current = state
      if (state) {
        resetSession()
      }
    }

    const onFullscreenChange = (state: boolean) => {
      if (!state && !isFullscreenActive()) {
        resetSession()
      }
    }

    const onResize = () => {
      if (!canHandleGesture()) {
        resetSession()
      }
    }

    /** 获取触摸点相对播放器的坐标 */
    const getTouchLocalPosition = (touch: Touch) => {
      const rect = art.template.$player.getBoundingClientRect()
      return {
        localX: touch.clientX - rect.left,
        localY: touch.clientY - rect.top,
        width: rect.width,
        height: rect.height,
      }
    }

    /** 从 changedTouches 中查找指定 identifier 的 Touch */
    const findTrackedTouch = (event: TouchEvent): Touch | null => {
      const session = sessionRef.current
      if (!session) return null

      for (let i = 0; i < event.changedTouches.length; i += 1) {
        const touch = event.changedTouches.item(i)
        if (touch?.identifier === session.touchId) {
          return touch
        }
      }

      return null
    }

    const onTouchStart = (event: TouchEvent) => {
      if (!canHandleGesture()) return
      if (sessionRef.current) return
      if (shouldIgnoreTarget(event.target)) return

      // 只跟踪第一个手指
      const touch = event.changedTouches.item(0)
      if (!touch) return

      const { localX, localY, width, height } = getTouchLocalPosition(touch)

      sessionRef.current = {
        touchId: touch.identifier,
        startX: localX,
        startY: localY,
        startTime: art.currentTime || 0,
        startVolume: art.video.volume,
        playerWidth: width,
        playerHeight: height,
        axis: null,
        pendingSeekTime: null,
        longPressTriggered: false,
      }

      playbackRateBeforeLongPressRef.current = art.playbackRate || 1
      clearLongPressTimer()
      longPressTimerRef.current = window.setTimeout(() => {
        const current = sessionRef.current
        if (!current) return
        if (current.touchId !== touch.identifier) return
        if (current.axis !== null) return
        if (!canHandleGesture()) return

        current.longPressTriggered = true
        art.playbackRate = mergedConfig.longPressPlaybackRate
      }, mergedConfig.longPressDurationMs)
    }

    const onTouchMove = (event: TouchEvent) => {
      const session = sessionRef.current
      if (!session) return

      const touch = findTrackedTouch(event)
      if (!touch) return

      const { localX, localY } = getTouchLocalPosition(touch)
      const deltaX = localX - session.startX
      const deltaY = localY - session.startY

      // 尚未确定方向时，根据滑动距离和角度判定
      if (session.axis === null) {
        const direction = resolveGestureDirection(deltaX, deltaY, mergedConfig.gestureActivationPx)
        if (!direction) return

        if (direction === 'vertical') {
          // 垂直滑动：仅在屏幕两侧区域才响应为音量调节
          const inVolumeZone = shouldHandleVolumeGesture(
            session.startX,
            session.playerWidth,
            mergedConfig.volumeSideZoneRatio,
          )
          if (inVolumeZone) {
            session.axis = 'vertical'
          } else {
            // 屏幕中间区域的垂直滑动不处理，放行给默认行为
            resetSession()
            return
          }
        } else {
          session.axis = 'horizontal'
        }

        clearLongPressTimer()
      }

      // 水平滑动 → 进度预览
      if (session.axis === 'horizontal') {
        const duration = Number.isFinite(art.duration) ? art.duration : Number.MAX_SAFE_INTEGER
        const previewTime = computeSeekPreviewTime(
          session.startTime,
          deltaX,
          duration,
          mergedConfig.seekSecondsPer100Px,
        )
        session.pendingSeekTime = previewTime
        onSeekGesturePreviewChange?.(previewTime)
        if (event.cancelable) {
          event.preventDefault()
        }
        return
      }

      // 垂直滑动 → 音量调节
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

    const onTouchEnd = (event: TouchEvent) => {
      const session = sessionRef.current
      if (!session) return

      const touch = findTrackedTouch(event)
      if (!touch) return

      clearLongPressTimer()

      // 长按加速中 → 恢复播放速度
      if (session.longPressTriggered) {
        restorePlaybackRate()
        sessionRef.current = null
        return
      }

      // 水平滑动结束 → 执行 seek
      if (session.axis === 'horizontal' && session.pendingSeekTime !== null) {
        art.seek = session.pendingSeekTime
        onSeekGesturePreviewEnd?.()
        sessionRef.current = null
        return
      }

      // 未产生滑动 → 判定单击/双击
      if (session.axis === null) {
        const { localX, localY, width } = getTouchLocalPosition(touch)
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
          suppressFollowupClicks(380)
          const action = resolveDoubleTapAction(localX, width, mergedConfig.doubleTapSideZoneRatio)
          if (action === 'forward') {
            art.forward = mergedConfig.doubleTapSeekSeconds
            art.notice.show = `快进 ${mergedConfig.doubleTapSeekSeconds} 秒`
          } else if (action === 'backward') {
            art.backward = mergedConfig.doubleTapSeekSeconds
            art.notice.show = `后退 ${mergedConfig.doubleTapSeekSeconds} 秒`
          } else {
            art.toggle()
            art.controls.show = false
            art.setting.show = false
            window.requestAnimationFrame(() => {
              art.controls.show = false
              art.setting.show = false
            })
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

      // 音量滑动结束
      if (session.axis === 'vertical') {
        onVolumeGestureEnd?.()
      }
      sessionRef.current = null
    }

    const onTouchCancel = () => {
      resetSession()
    }

    const onClickCapture = (event: Event) => {
      if (Date.now() > suppressClickUntilRef.current) return
      if (shouldIgnoreTarget(event.target)) return
      event.preventDefault()
      event.stopPropagation()
      const stopImmediatePropagation = (event as Event & { stopImmediatePropagation?: () => void })
        .stopImmediatePropagation
      stopImmediatePropagation?.call(event)
    }

    // 仅注册 Touch 事件，避免与 Pointer 事件重复触发
    art.template.$player.addEventListener('touchstart', onTouchStart, { passive: false })
    art.template.$player.addEventListener('touchmove', onTouchMove, { passive: false })
    art.template.$player.addEventListener('touchend', onTouchEnd)
    art.template.$player.addEventListener('touchcancel', onTouchCancel)
    art.template.$player.addEventListener('click', onClickCapture, true)
    art.template.$player.addEventListener('dblclick', onClickCapture, true)

    art.on('lock', onLock)
    art.on('fullscreenWeb', onFullscreenChange)
    art.on('fullscreen', onFullscreenChange)
    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('orientationchange', onResize)

    return () => {
      resetSession()
      art.template.$player.removeEventListener('touchstart', onTouchStart)
      art.template.$player.removeEventListener('touchmove', onTouchMove)
      art.template.$player.removeEventListener('touchend', onTouchEnd)
      art.template.$player.removeEventListener('touchcancel', onTouchCancel)
      art.template.$player.removeEventListener('click', onClickCapture, true)
      art.template.$player.removeEventListener('dblclick', onClickCapture, true)
      art.off('lock', onLock)
      art.off('fullscreenWeb', onFullscreenChange)
      art.off('fullscreen', onFullscreenChange)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [
    art,
    enabled,
    mergedConfig,
    onSeekGesturePreviewChange,
    onSeekGesturePreviewEnd,
    onVolumeGestureChange,
    onVolumeGestureEnd,
  ])
}
