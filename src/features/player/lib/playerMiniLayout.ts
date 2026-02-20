interface ComputeMiniPlayerRectParams {
  viewportWidth: number
  viewportHeight: number
  currentWidth: number
  currentHeight: number
  isMobile: boolean
  isTablet: boolean
}

export interface MiniPlayerRect {
  width: number
  height: number
  top: number
  left: number
}

const EDGE_GAP = 8

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function computeMiniPlayerRect(params: ComputeMiniPlayerRectParams): MiniPlayerRect {
  const safeViewportWidth = Math.max(1, params.viewportWidth)
  const safeViewportHeight = Math.max(1, params.viewportHeight)
  const isSmallScreen = params.isMobile || params.isTablet

  const defaultWidth = params.currentWidth > 0 ? params.currentWidth : 320
  const defaultHeight = params.currentHeight > 0 ? params.currentHeight : 180

  const width = isSmallScreen ? (params.isMobile ? 240 : 280) : defaultWidth
  const height = isSmallScreen ? (params.isMobile ? 135 : 158) : defaultHeight

  const rawTop = isSmallScreen ? 72 : safeViewportHeight - height - 100
  const rawLeft = isSmallScreen
    ? safeViewportWidth - width - (params.isMobile ? 12 : 16)
    : safeViewportWidth - width - 50

  const top = clamp(rawTop, EDGE_GAP, Math.max(EDGE_GAP, safeViewportHeight - height - EDGE_GAP))
  const left = clamp(rawLeft, EDGE_GAP, Math.max(EDGE_GAP, safeViewportWidth - width - EDGE_GAP))

  return {
    width,
    height,
    top,
    left,
  }
}
