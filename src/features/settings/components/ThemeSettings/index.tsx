import { useTheme } from '@/shared/components/theme'
import { Check, Monitor, Moon, Palette, Sun } from 'lucide-react'
import { cn } from '@/shared/lib'
import { SettingsSection } from '../common'

const modeOptions = [
  { value: 'light', label: '浅色', description: '明亮清晰', icon: Sun },
  { value: 'dark', label: '深色', description: '沉浸观影', icon: Moon },
  { value: 'system', label: '跟随系统', description: '自动适应设备', icon: Monitor },
] as const

export default function ThemeSettings() {
  const { mode, changeMode } = useTheme()

  return (
    <SettingsSection
      title="界面外观"
      description="选择适合当前环境的显示模式。"
      icon={<Palette className="size-4" />}
    >
      <fieldset>
        <legend className="sr-only">主题模式</legend>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {modeOptions.map(({ value, label, description, icon: Icon }) => (
            <label key={value} className="relative min-w-0 cursor-pointer">
              <input
                className="peer sr-only"
                type="radio"
                name="settings-theme"
                value={value}
                checked={mode === value}
                onChange={() => changeMode(value)}
              />
              <div
                className={cn(
                  'border-border peer-focus-visible:ring-ring rounded-xl border p-2.5 transition-colors peer-focus-visible:ring-2 sm:p-3',
                  mode === value ? 'border-primary bg-muted/40' : 'hover:bg-muted/30',
                )}
              >
                <div
                  aria-hidden="true"
                  className={cn(
                    'relative mb-3 h-16 overflow-hidden rounded-md border sm:h-20',
                    value === 'dark' ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white',
                  )}
                >
                  {value === 'system' && (
                    <div className="absolute inset-y-0 right-0 w-1/2 bg-zinc-900" />
                  )}
                  <div
                    className={cn(
                      'absolute inset-y-0 left-0 w-1/5 border-r',
                      value === 'dark'
                        ? 'border-zinc-700 bg-zinc-800'
                        : 'border-zinc-200 bg-zinc-100',
                    )}
                  />
                  <div className="absolute top-3 right-2 left-[30%] flex gap-1.5 sm:gap-2">
                    {[0, 1, 2].map(index => (
                      <span
                        key={index}
                        className={cn(
                          'h-9 flex-1 rounded-sm sm:h-12',
                          value === 'dark'
                            ? 'bg-zinc-700'
                            : value === 'system' && index > 0
                              ? 'bg-zinc-600'
                              : 'bg-zinc-200',
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium sm:text-sm">
                  <Icon aria-hidden="true" className="hidden size-3.5 shrink-0 sm:block" />
                  <span className="truncate">{label}</span>
                </div>
                {mode === value && (
                  <Check
                    aria-hidden="true"
                    className="bg-primary text-primary-foreground absolute top-2 right-2 size-4 rounded-full p-0.5"
                  />
                )}
                <p className="text-muted-foreground mt-1 hidden text-xs sm:block">{description}</p>
              </div>
            </label>
          ))}
        </div>
      </fieldset>
    </SettingsSection>
  )
}
