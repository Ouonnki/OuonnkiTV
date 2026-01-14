/**
 * 主题模块统一导出
 *
 * 使用方式:
 * import { useTheme, ThemeToggle, useThemeStore } from '@/shared/components/theme'
 */

// Components
export { ThemeInitializer } from './ThemeInitializer'
export { ThemeToggle } from './ThemeToggle'

// Hooks
export { useThemeControl as useTheme, useThemeState } from './hooks/useTheme'

// Store
export { useThemeStore, type ThemeState } from './store'

// Utils
export {
  hexToOklch,
  parseOklch,
  calculateDarkAccent,
  calculateForeground,
  getDefaultAccent,
  applyThemeVariables,
  clearThemeVariables,
} from './utils'

// Transitions
export { supportsViewTransitions, themeTransition, themeTransitionFromEvent } from './transitions'
