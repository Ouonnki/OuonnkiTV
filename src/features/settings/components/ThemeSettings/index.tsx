import { useTheme } from '@/shared/components/theme'
import { useRef } from 'react'
import { Palette, Sun, Moon, Monitor } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib'
import { SettingsItem, SettingsSection } from '../common'

export default function ThemeSettings() {
  const { mode, changeMode } = useTheme()

  const lastClickEvent = useRef<MouseEvent | null>(null)
  const modeOptions = [
    { value: 'light' as const, label: '亮色', icon: Sun },
    { value: 'dark' as const, label: '暗色', icon: Moon },
    { value: 'system' as const, label: '系统', icon: Monitor },
  ]

  const handleModeChange = (newMode: 'light' | 'dark' | 'system') => {
    changeMode(newMode, lastClickEvent.current ?? undefined)
    lastClickEvent.current = null
  }

  return (
    <SettingsSection
      title="主题设置"
      description="选择你偏好的显示模式，支持跟随系统与动画切换。"
      icon={<Palette className="size-4" />}
      tone="rose"
      action={
        <Badge variant="secondary">
          当前：{mode === 'system' ? '系统' : mode === 'light' ? '亮色' : '暗色'}
        </Badge>
      }
    >
      <SettingsItem
        title="主题模式"
        description="支持亮色、暗色与跟随系统。"
        className="items-start sm:items-center"
      >
        <div className="bg-muted relative inline-flex w-full max-w-sm items-center rounded-full p-1">
          {modeOptions.map(option => {
            const isActive = mode === option.value
            const Icon = option.icon

            return (
              <button
                key={option.value}
                type="button"
                onPointerDown={e => {
                  lastClickEvent.current = e.nativeEvent as unknown as MouseEvent
                }}
                onClick={() => handleModeChange(option.value)}
                className={cn(
                  'relative z-10 flex min-w-0 flex-1 items-center justify-center gap-1 rounded-full px-2 py-1.5 text-xs font-medium transition-colors sm:gap-1.5 sm:px-3 sm:text-sm',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary/80',
                )}
              >
                <Icon className="size-3.5 shrink-0" />
                <span className="whitespace-nowrap leading-none">{option.label}</span>
                {isActive ? (
                  <motion.span
                    layoutId="theme-mode-indicator"
                    className="bg-background absolute inset-0 -z-10 rounded-full shadow-sm"
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                ) : null}
              </button>
            )
          })}
        </div>
      </SettingsItem>
    </SettingsSection>
  )
}
