import { useTheme } from 'next-themes'
import { useThemeStore } from '../store'
import { themeTransition, themeTransitionFromEvent } from '../transitions'
import { useCallback } from 'react'

/**
 * 主题控制 Hook
 * 整合 next-themes 和 themeStore，提供统一的主题控制接口
 */
export function useThemeControl() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme()
  const { mode, setMode } = useThemeStore()

  /**
   * 切换主题模式 (带动画)
   */
  const changeMode = useCallback(
    (newMode: 'system' | 'light' | 'dark', event?: MouseEvent | React.MouseEvent) => {
      const doChange = () => {
        setMode(newMode)
        setTheme(newMode)
      }

      // 判断动画方向: 切换到暗色=扩散, 切换到亮色=收缩
      const currentResolved = resolvedTheme || 'light'
      const targetIsDark =
        newMode === 'dark' ||
        (newMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      const direction = targetIsDark && currentResolved === 'light' ? 'expand' : 'contract'

      if (event) {
        themeTransitionFromEvent(event, doChange, direction as 'expand' | 'contract')
      } else {
        themeTransition(doChange, { direction: direction as 'expand' | 'contract' })
      }
    },
    [setMode, setTheme, resolvedTheme],
  )

  /**
   * 快速切换亮/暗模式
   */
  const toggleDarkMode = useCallback(
    (event?: MouseEvent | React.MouseEvent) => {
      const currentResolved = resolvedTheme || 'light'
      const newMode = currentResolved === 'dark' ? 'light' : 'dark'
      changeMode(newMode, event)
    },
    [resolvedTheme, changeMode],
  )

  /**
   * 当前是否为暗色模式
   */
  const isDark = resolvedTheme === 'dark'

  return {
    // 状态
    mode,
    theme,
    resolvedTheme,
    systemTheme,
    isDark,

    // 方法
    changeMode,
    toggleDarkMode,
    resetTheme: useThemeStore(state => state.resetTheme),
  }
}

/**
 * 获取当前主题状态的简化 Hook
 * 配合 ThemeToggle 使用以渲染对应的图标
 */
export function useThemeState() {
  const { isDark, resolvedTheme, mode } = useThemeControl()
  return { isDark, resolvedTheme, mode }
}
