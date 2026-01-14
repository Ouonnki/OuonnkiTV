/**
 * 主题模块统一导出
 *
 * 使用方式:
 * import { useTheme, ThemeToggle, useThemeStore } from '@/shared/components/theme'
 */

// Components
export { ThemeToggle } from './ThemeToggle'

// Hooks
export { useThemeControl as useTheme, useThemeState } from './hooks/useTheme'

// Store
export { useThemeStore, type ThemeState } from './store'

// Utils
// Utils
// No utilities exported currently

// Transitions
export { supportsViewTransitions, themeTransition, themeTransitionFromEvent } from './transitions'
