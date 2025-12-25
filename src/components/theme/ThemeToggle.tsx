import { Button } from '@heroui/react'
import { Moon, Sun } from 'lucide-react'
import { useThemeControl } from './hooks/useTheme'
import { useRef } from 'react'

/**
 * 主题切换按钮
 * 点击时切换亮色/暗色模式，支持 View Transitions 动画
 */
export function ThemeToggle() {
  const { isDark, toggleDarkMode } = useThemeControl()
  const lastClickEvent = useRef<MouseEvent | null>(null)

  return (
    <Button
      isIconOnly
      className="bg-white/20 shadow-lg shadow-gray-500/10 backdrop-blur-2xl dark:bg-black/20"
      // 使用 onPointerDown 捕获原生事件坐标
      onPointerDown={e => {
        lastClickEvent.current = e.nativeEvent as unknown as MouseEvent
      }}
      onPress={() => {
        toggleDarkMode(lastClickEvent.current ?? undefined)
        lastClickEvent.current = null
      }}
      aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </Button>
  )
}
