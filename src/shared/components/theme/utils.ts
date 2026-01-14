/**
 * 主题工具函数
 * 提供颜色转换和 CSS 变量注入功能
 */

/**
 * 解析 HEX 颜色为 RGB 分量
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return null
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

/**
 * 将 sRGB 分量转换为线性 RGB
 */
function srgbToLinear(c: number): number {
  c = c / 255
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

/**
 * 将 HEX 颜色转换为 OKLCH 格式
 * @param hex HEX 颜色值 (如 #FF5733)
 * @returns OKLCH 格式字符串 (如 "oklch(0.628 0.258 29.234)")
 */
export function hexToOklch(hex: string): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return 'oklch(0 0 0)'

  // sRGB to Linear RGB
  const lr = srgbToLinear(rgb.r)
  const lg = srgbToLinear(rgb.g)
  const lb = srgbToLinear(rgb.b)

  // Linear RGB to XYZ (D65)
  const x = 0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb
  const y = 0.2126729 * lr + 0.7151522 * lg + 0.072175 * lb
  const z = 0.0193339 * lr + 0.119192 * lg + 0.9503041 * lb

  // XYZ to LMS
  const l = 0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z
  const m = 0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z
  const s = 0.0482003018 * x + 0.2643662691 * y + 0.6338517028 * z

  // LMS to LMS'
  const lp = Math.cbrt(l)
  const mp = Math.cbrt(m)
  const sp = Math.cbrt(s)

  // LMS' to OKLab
  const L = 0.2104542553 * lp + 0.793617785 * mp - 0.0040720468 * sp
  const a = 1.9779984951 * lp - 2.428592205 * mp + 0.4505937099 * sp
  const b = 0.0259040371 * lp + 0.7827717662 * mp - 0.808675766 * sp

  // OKLab to OKLCH
  const C = Math.sqrt(a * a + b * b)
  let H = (Math.atan2(b, a) * 180) / Math.PI
  if (H < 0) H += 360

  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(3)})`
}

/**
 * 解析 OKLCH 字符串为分量
 */
export function parseOklch(oklch: string): { L: number; C: number; H: number } | null {
  const match = oklch.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/)
  if (!match) return null
  return {
    L: parseFloat(match[1]),
    C: parseFloat(match[2]),
    H: parseFloat(match[3]),
  }
}

/**
 * 根据亮色强调色计算暗色强调色
 * 策略: 亮度反转，色调保持
 * @param lightOklch 亮色模式的 OKLCH 值
 * @returns 暗色模式的 OKLCH 字符串
 */
export function calculateDarkAccent(lightOklch: string): string {
  const parsed = parseOklch(lightOklch)
  if (!parsed) return 'oklch(1 0 0)' // fallback 纯白

  // 亮度反转
  const darkL = 1 - parsed.L

  // 确保最小对比度
  const minL = 0.7
  const finalL = Math.max(darkL, minL)

  return `oklch(${finalL.toFixed(3)} ${parsed.C.toFixed(3)} ${parsed.H.toFixed(3)})`
}

/**
 * 计算前景色 (用于文字)
 * 根据背景亮度自动选择黑色或白色
 */
export function calculateForeground(oklch: string): string {
  const parsed = parseOklch(oklch)
  if (!parsed) return 'oklch(0 0 0)'

  // 亮度 > 0.5 使用黑色文字, 否则使用白色
  return parsed.L > 0.5 ? 'oklch(0 0 0)' : 'oklch(1 0 0)'
}

/**
 * 获取默认强调色
 * Light: 纯黑, Dark: 纯白
 */
export function getDefaultAccent(isDark: boolean): string {
  return isDark ? 'oklch(1 0 0)' : 'oklch(0 0 0)'
}

/**
 * 将主题变量应用到 DOM
 * 注意: 强调色仅在亮色模式生效，暗色模式使用 CSS 默认样式
 */
export function applyThemeVariables(
  accentColor: string | null,
  isDark: boolean,
  radius: number,
): void {
  const root = document.documentElement

  if (isDark) {
    // 暗色模式：移除自定义变量，使用 CSS 默认的 shadcn/ui 暗色样式
    root.style.removeProperty('--primary')
    root.style.removeProperty('--primary-foreground')
    root.style.removeProperty('--accent')
    root.style.removeProperty('--accent-foreground')
  } else if (accentColor) {
    // 亮色模式 + 自定义强调色
    const accent = hexToOklch(accentColor)
    const accentForeground = calculateForeground(accent)
    root.style.setProperty('--primary', accent)
    root.style.setProperty('--primary-foreground', accentForeground)
    root.style.setProperty('--accent', accent)
    root.style.setProperty('--accent-foreground', accentForeground)
  } else {
    // 亮色模式 + 默认强调色：也移除自定义变量使用 CSS 默认值
    root.style.removeProperty('--primary')
    root.style.removeProperty('--primary-foreground')
    root.style.removeProperty('--accent')
    root.style.removeProperty('--accent-foreground')
  }

  // radius 始终应用
  root.style.setProperty('--radius', `${radius}rem`)
}

/**
 * 清除自定义主题变量，恢复 CSS 默认值
 */
export function clearThemeVariables(): void {
  const root = document.documentElement
  root.style.removeProperty('--primary')
  root.style.removeProperty('--primary-foreground')
  root.style.removeProperty('--accent')
  root.style.removeProperty('--accent-foreground')
  root.style.removeProperty('--radius')
}
