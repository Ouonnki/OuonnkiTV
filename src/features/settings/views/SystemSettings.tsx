import NetworkSettings from '../components/NetworkSettings'
import SearchSettings from '../components/SearchSettings'
import ThemeSettings from '../components/ThemeSettings'
import { useSettingStore } from '@/shared/store/settingStore'
import { Switch } from '@/shared/components/ui/switch'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Cog, KeyRound } from 'lucide-react'
import { SettingsItem, SettingsPageShell, SettingsSection } from '../components/common'

export default function SystemSettings() {
  const { system, setSystemSettings } = useSettingStore()

  const hasEnvToken = Boolean(import.meta.env.OKI_TMDB_API_TOKEN)
  const hasUserToken = Boolean(system.tmdbApiToken)
  const hasTmdbToken = hasEnvToken || hasUserToken

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
        {!hasEnvToken && (
          <SettingsItem
            title="TMDB API Token"
            description="未检测到环境变量 Token，可手动输入以启用 TMDB 功能。从 themoviedb.org 获取。"
            control={
              <div className="relative w-full sm:w-[340px]">
                <KeyRound className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  type="password"
                  className="pl-9"
                  value={system.tmdbApiToken}
                  placeholder="输入 TMDB API Token"
                  onChange={e => setSystemSettings({ tmdbApiToken: e.target.value.trim() })}
                />
              </div>
            }
          />
        )}
        <SettingsItem
          title="TMDB 智能模式"
          description={
            hasTmdbToken
              ? '启用后通过 TMDB 获取影片元数据、海报和推荐内容，关闭后仅使用视频源数据。'
              : '请先在上方输入 TMDB API Token 后启用。'
          }
          controlClassName="self-end mt-1"
          control={
            <Switch
              checked={system.tmdbEnabled}
              disabled={!hasTmdbToken}
              onCheckedChange={checked => setSystemSettings({ tmdbEnabled: checked })}
            />
          }
        />
        {system.tmdbEnabled && (
          <>
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
          </>
        )}
      </SettingsSection>
    </SettingsPageShell>
  )
}
