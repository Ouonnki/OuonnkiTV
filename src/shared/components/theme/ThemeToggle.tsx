import { Slot } from '@radix-ui/react-slot'
import { useThemeControl } from './hooks/useTheme'
import { useRef, type ReactNode } from 'react'

interface ThemeToggleProps {
  children: ReactNode
  /**
   * 是否将 props 合并到子元素上
   * @default true
   */
  asChild?: boolean
}

/**
 * 主题切换组件 (Headless)
 * 使用 asChild 模式，将切换行为注入到任意子元素
 *
 * @example
 * ```tsx
 * // 基础用法 - 包裹任意元素
 * <ThemeToggle>
 *   <Button size="icon" variant="ghost">
 *     {isDark ? <Sun /> : <Moon />}
 *   </Button>
 * </ThemeToggle>
 *
 * // 自定义样式
 * <ThemeToggle>
 *   <div className="custom-toggle">Toggle Theme</div>
 * </ThemeToggle>
 * ```
 */
export function ThemeToggle({ children, asChild = true }: ThemeToggleProps) {
  const { changeMode, mode } = useThemeControl()
  const lastClickEvent = useRef<MouseEvent | null>(null)

  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      onPointerDown={(e: React.PointerEvent) => {
        lastClickEvent.current = e.nativeEvent as unknown as MouseEvent
      }}
      onClick={() => {
        const nextMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light'
        changeMode(nextMode, lastClickEvent.current ?? undefined)
        lastClickEvent.current = null
      }}
      aria-label={
        mode === 'light' ? '切换到暗色模式' : mode === 'dark' ? '切换到跟随系统' : '切换到亮色模式'
      }
    >
      {children}
    </Comp>
  )
}
