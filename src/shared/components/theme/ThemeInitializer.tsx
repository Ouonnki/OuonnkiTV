import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useThemeStore } from './store'
import { applyThemeVariables } from './utils'

/**
 * 主题初始化组件
 * 无 UI 渲染，负责在首屏和主题变化时应用 CSS 变量
 */
export function ThemeInitializer() {
  const { resolvedTheme } = useTheme()
  const { accentColor, radius } = useThemeStore()

  useEffect(() => {
    // resolvedTheme 在客户端挂载前可能为 undefined
    if (resolvedTheme === undefined) return

    const isDark = resolvedTheme === 'dark'
    applyThemeVariables(accentColor, isDark, radius)
  }, [resolvedTheme, accentColor, radius])

  // 无 UI 渲染
  return null
}
