import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export interface ThemeState {
  mode: 'system' | 'light' | 'dark'
  modeUpdatedAt: number
}

interface ThemeActions {
  setMode: (mode: ThemeState['mode']) => void
  resetTheme: () => void
}

type ThemeStore = ThemeState & ThemeActions

const buildDefaultThemeState = (): ThemeState => ({
  mode: 'system',
  modeUpdatedAt: Date.now(),
})

export const useThemeStore = create<ThemeStore>()(
  devtools(
    persist(
      immer<ThemeStore>(set => ({
        ...buildDefaultThemeState(),

        setMode: mode => {
          set(state => {
            state.mode = mode
            state.modeUpdatedAt = Date.now()
          })
        },

        resetTheme: () => {
          set(state => {
            const defaults = buildDefaultThemeState()
            state.mode = defaults.mode
            state.modeUpdatedAt = defaults.modeUpdatedAt
          })
        },
      })),
      {
        name: 'ouonnki-tv-theme-store',
        version: 2,
        migrate: persistedState => {
          const state = persistedState as Partial<ThemeState> | undefined
          return {
            mode: state?.mode ?? 'system',
            modeUpdatedAt: state?.modeUpdatedAt ?? Date.now(),
          }
        },
      },
    ),
    {
      name: 'ThemeStore',
    },
  ),
)
