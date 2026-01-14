import { Button } from '@/shared/components/ui/button'
import { useTheme } from '@/shared/components/theme'
import { useRef } from 'react'
import { Palette, Sun, Moon, Monitor } from 'lucide-react'

export default function ThemeSettings() {
  const { mode } = useTheme()
  const { changeMode } = useTheme()
  // Ensure we are using the store's mode if needed, but useTheme hook returns mode as well (from next-themes usually, but here our hook combines them).
  // Actually, looking at useTheme hook: it returns mode from store.
  // Wait, let's check useThemeControl return values again.
  // It returns { mode, theme, resolvedTheme, systemTheme, isDark, changeMode, toggleDarkMode, resetTheme }
  // The original code destructured { isDark, changeMode, mode } from useTheme().
  // references: line 23: const { isDark, changeMode, mode } = useTheme()
  // So I can keep that.

  const lastClickEvent = useRef<MouseEvent | null>(null)

  const handleModeChange = (newMode: 'light' | 'dark' | 'system') => {
    changeMode(newMode, lastClickEvent.current ?? undefined)
    lastClickEvent.current = null
  }

  return (
    <div className="flex flex-col gap-6 px-4 md:px-8">
      {/* Header */}
      <div className="flex items-center gap-3 py-4">
        <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
          <Palette className="text-primary h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">主题设置</h1>
          <p className="text-sm text-gray-500">自定义应用外观</p>
        </div>
      </div>

      {/* 主题模式 */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white/40 p-6 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/40">
        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">主题模式</h2>
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant={mode === 'light' ? 'default' : 'outline'}
            onPointerDown={e => {
              lastClickEvent.current = e.nativeEvent as unknown as MouseEvent
            }}
            onClick={() => handleModeChange('light')}
            className="flex h-auto flex-col gap-1 py-4"
          >
            <Sun size={20} />
            <span className="text-xs">亮色</span>
          </Button>
          <Button
            variant={mode === 'dark' ? 'default' : 'outline'}
            onPointerDown={e => {
              lastClickEvent.current = e.nativeEvent as unknown as MouseEvent
            }}
            onClick={() => handleModeChange('dark')}
            className="flex h-auto flex-col gap-1 py-4"
          >
            <Moon size={20} />
            <span className="text-xs">暗色</span>
          </Button>
          <Button
            variant={mode === 'system' ? 'default' : 'outline'}
            onPointerDown={e => {
              lastClickEvent.current = e.nativeEvent as unknown as MouseEvent
            }}
            onClick={() => handleModeChange('system')}
            className="flex h-auto flex-col gap-1 py-4"
          >
            <Monitor size={20} />
            <span className="text-xs">跟随系统</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
