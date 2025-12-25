import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export interface ThemeState {
  /** 主题模式: system 跟随系统, light 亮色, dark 暗色 */
  mode: 'system' | 'light' | 'dark'
  /** 用户自定义强调色 (HEX 格式), null 表示使用默认纯黑 */
  accentColor: string | null
  /** 圆角半径 (rem) */
  radius: number
  /** 是否启用颜色过渡动画 */
  transitionEnabled: boolean
}

interface ThemeActions {
  setMode: (mode: ThemeState['mode']) => void
  setAccentColor: (color: string | null) => void
  setRadius: (radius: number) => void
  setTransitionEnabled: (enabled: boolean) => void
  resetTheme: () => void
}

type ThemeStore = ThemeState & ThemeActions

const DEFAULT_THEME: ThemeState = {
  mode: 'system',
  accentColor: null,
  radius: 0.625,
  transitionEnabled: true,
}

export const useThemeStore = create<ThemeStore>()(
  devtools(
    persist(
      immer<ThemeStore>(set => ({
        ...DEFAULT_THEME,

        setMode: mode => {
          set(state => {
            state.mode = mode
          })
        },

        setAccentColor: color => {
          set(state => {
            state.accentColor = color
          })
        },

        setRadius: radius => {
          set(state => {
            state.radius = radius
          })
        },

        setTransitionEnabled: enabled => {
          set(state => {
            state.transitionEnabled = enabled
          })
        },

        resetTheme: () => {
          set(state => {
            state.mode = DEFAULT_THEME.mode
            state.accentColor = DEFAULT_THEME.accentColor
            state.radius = DEFAULT_THEME.radius
            state.transitionEnabled = DEFAULT_THEME.transitionEnabled
          })
        },
      })),
      {
        name: 'ouonnki-tv-theme-store',
        version: 1,
      },
    ),
    {
      name: 'ThemeStore',
    },
  ),
)
