import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export interface ThemeState {
  /** 主题模式: system 跟随系统, light 亮色, dark 暗色 */
  mode: 'system' | 'light' | 'dark'
}

interface ThemeActions {
  setMode: (mode: ThemeState['mode']) => void
  resetTheme: () => void
}

type ThemeStore = ThemeState & ThemeActions

const DEFAULT_THEME: ThemeState = {
  mode: 'system',
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

        resetTheme: () => {
          set(state => {
            state.mode = DEFAULT_THEME.mode
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
