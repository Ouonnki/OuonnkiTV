import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@heroui/react'
import { useTheme, useThemeStore } from '@/components/theme'
import { useState, useRef } from 'react'
import { Palette, RotateCcw, Sun, Moon, Monitor } from 'lucide-react'

/** 预设颜色 */
const PRESET_COLORS = [
  { name: '默认', value: null },
  { name: '紫罗兰', value: '#8B5CF6' },
  { name: '蓝色', value: '#3B82F6' },
  { name: '青色', value: '#06B6D4' },
  { name: '绿色', value: '#10B981' },
  { name: '黄色', value: '#F59E0B' },
  { name: '橙色', value: '#F97316' },
  { name: '红色', value: '#EF4444' },
  { name: '粉色', value: '#EC4899' },
]

export default function ThemeSettings() {
  const { isDark, changeMode, mode } = useTheme()
  const { accentColor, transitionEnabled, setAccentColor, setTransitionEnabled, resetTheme } =
    useThemeStore()

  const [customColor, setCustomColor] = useState(accentColor || '')
  const lastClickEvent = useRef<MouseEvent | null>(null)

  const handleCustomColorApply = () => {
    if (/^#[0-9A-Fa-f]{6}$/.test(customColor)) {
      setAccentColor(customColor)
    }
  }

  // 封装带坐标捕获的模式切换
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
            variant={mode === 'light' ? 'solid' : 'bordered'}
            color={mode === 'light' ? 'primary' : 'default'}
            onPointerDown={e => {
              lastClickEvent.current = e.nativeEvent as unknown as MouseEvent
            }}
            onPress={() => handleModeChange('light')}
            className="flex flex-col gap-1 py-4"
          >
            <Sun size={20} />
            <span className="text-xs">亮色</span>
          </Button>
          <Button
            variant={mode === 'dark' ? 'solid' : 'bordered'}
            color={mode === 'dark' ? 'primary' : 'default'}
            onPointerDown={e => {
              lastClickEvent.current = e.nativeEvent as unknown as MouseEvent
            }}
            onPress={() => handleModeChange('dark')}
            className="flex flex-col gap-1 py-4"
          >
            <Moon size={20} />
            <span className="text-xs">暗色</span>
          </Button>
          <Button
            variant={mode === 'system' ? 'solid' : 'bordered'}
            color={mode === 'system' ? 'primary' : 'default'}
            onPointerDown={e => {
              lastClickEvent.current = e.nativeEvent as unknown as MouseEvent
            }}
            onPress={() => handleModeChange('system')}
            className="flex flex-col gap-1 py-4"
          >
            <Monitor size={20} />
            <span className="text-xs">跟随系统</span>
          </Button>
        </div>
      </div>

      {/* 强调色 */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white/40 p-6 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/40">
        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">强调色</h2>

        {/* 预设颜色 */}
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map(color => (
            <button
              key={color.name}
              onClick={() => setAccentColor(color.value)}
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                accentColor === color.value
                  ? 'border-primary ring-primary/30 scale-110 ring-2'
                  : 'border-gray-300 hover:scale-105 dark:border-gray-600'
              }`}
              style={{
                backgroundColor: color.value || (isDark ? '#ffffff' : '#000000'),
              }}
              title={color.name}
            />
          ))}
        </div>

        {/* 自定义颜色 */}
        <div className="flex gap-2">
          <Input
            placeholder="#FF5733"
            value={customColor}
            onChange={e => setCustomColor(e.target.value)}
            className="flex-1"
          />
          <Button onPress={handleCustomColorApply} color="primary" size="md">
            应用
          </Button>
        </div>

        {/* 当前颜色显示 */}
        <div className="flex items-center gap-3 rounded-lg bg-gray-100 p-3 dark:bg-gray-700/50">
          <div
            className="h-8 w-8 rounded-full border border-gray-300 dark:border-gray-500"
            style={{
              backgroundColor: accentColor || (isDark ? '#ffffff' : '#000000'),
            }}
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            当前强调色: {accentColor || '默认'}
          </span>
        </div>
      </div>

      {/* 过渡动画 */}
      <div className="flex flex-row items-center justify-between rounded-xl border border-gray-200 bg-white/40 p-6 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/40">
        <div className="space-y-0.5">
          <Label className="text-base text-gray-800 dark:text-gray-100">切换动画</Label>
          <p className="text-sm text-gray-500">启用主题切换时的圆形扩散动画</p>
        </div>
        <Switch checked={transitionEnabled} onCheckedChange={setTransitionEnabled} />
      </div>

      {/* 重置 */}
      <Button
        variant="bordered"
        color="danger"
        onPress={resetTheme}
        startContent={<RotateCcw size={16} />}
        className="w-full"
      >
        重置主题设置
      </Button>
    </div>
  )
}
