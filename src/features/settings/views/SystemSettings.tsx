import NetworkSettings from '../components/NetworkSettings'
import SearchSettings from '../components/SearchSettings'
import ThemeSettings from '../components/ThemeSettings'
import { useSettingStore } from '@/shared/store/settingStore'
import { Switch } from '@/shared/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Cog } from 'lucide-react'
import { SettingsItem, SettingsPageShell, SettingsSection } from '../components/common'

export default function SystemSettings() {
  const { system, setSystemSettings } = useSettingStore()

  return (
    <SettingsPageShell
      title="系统设置"
      description="组合网络、搜索、主题与系统行为，统一管理应用偏好。"
      showHeader={false}
    >
      <NetworkSettings />
      <SearchSettings />
      <ThemeSettings />
      <SettingsSection
        title="系统行为"
        description="控制系统级交互与提示策略。"
        icon={<Cog className="size-4" />}
        tone="cyan"
      >
        <SettingsItem
          title="自动显示更新日志"
          description="检测到新版本时自动弹出更新说明窗口。"
          controlClassName="self-end mt-1"
          control={
            <Switch
              checked={system.isUpdateLogEnabled}
              onCheckedChange={checked => setSystemSettings({ isUpdateLogEnabled: checked })}
            />
          }
        />
        <SettingsItem
          title="TMDB 内容语言"
          description="影响影片标题、简介等 TMDB 数据的显示语言。"
          control={
            <div className="w-full sm:w-[200px]">
              <Select
                value={system.tmdbLanguage}
                onValueChange={value => setSystemSettings({ tmdbLanguage: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh-CN">简体中文</SelectItem>
                  <SelectItem value="zh-TW">繁體中文</SelectItem>
                  <SelectItem value="en-US">English</SelectItem>
                  <SelectItem value="ja-JP">日本語</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />
        <SettingsItem
          title="TMDB 图片质量"
          description="海报和背景图的加载质量，高质量消耗更多流量。"
          control={
            <div className="w-full sm:w-[200px]">
              <Select
                value={system.tmdbImageQuality}
                onValueChange={(value: 'low' | 'medium' | 'high') =>
                  setSystemSettings({ tmdbImageQuality: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">低（w342）</SelectItem>
                  <SelectItem value="medium">中（w500/w780）</SelectItem>
                  <SelectItem value="high">高（original）</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />
      </SettingsSection>
    </SettingsPageShell>
  )
}
