import NetworkSettings from '../components/NetworkSettings'
import SearchSettings from '../components/SearchSettings'
import ThemeSettings from '../components/ThemeSettings'
import { useSettingStore } from '@/shared/store/settingStore'
import { SettingsSwitch as Switch } from '../components/common'
import { SettingsInput as Input } from '../components/common'
import { SettingsSelectTrigger as SelectTrigger } from '../components/common'
import { Select, SelectContent, SelectItem, SelectValue } from '@/shared/components/ui/select'
import { Cog, Film, Image, KeyRound, Link2 } from 'lucide-react'
import { SettingsItem, SettingsPageShell, SettingsSection } from '../components/common'
import { getPublicEnv } from '@/shared/config/runtimeEnv'

export default function SystemSettings() {
  const { system, setSystemSettings } = useSettingStore()

  const hasEnvToken = Boolean(getPublicEnv('OKI_TMDB_API_TOKEN'))
  const hasUserToken = Boolean(system.tmdbApiToken)
  const hasTmdbToken = hasEnvToken || hasUserToken
  const tmdbApiBaseUrlPlaceholder =
    getPublicEnv('OKI_TMDB_API_BASE_URL') || 'https://api.themoviedb.org/3'
  const tmdbImageBaseUrlPlaceholder =
    getPublicEnv('OKI_TMDB_IMAGE_BASE_URL') || 'https://image.tmdb.org/t/p/'

  return (
    <SettingsPageShell
      title="系统设置"
      description="调整界面外观、搜索与网络，让应用按你的习惯运行。"
    >
      <ThemeSettings />
      <SearchSettings />
      <NetworkSettings />
      <SettingsSection
        title="系统行为"
        description="控制系统级交互与提示策略。"
        icon={<Cog className="size-4" />}
      >
        <SettingsItem
          title="自动显示更新日志"
          description="检测到新版本时自动弹出更新说明窗口。"
          control={
            <Switch
              checked={system.isUpdateLogEnabled}
              onCheckedChange={checked => setSystemSettings({ isUpdateLogEnabled: checked })}
            />
          }
        />
        <SettingsItem
          title="滚动收起导航动画"
          description={
            <span>
              启用后会在下滑时收起顶部导航和侧边栏，并在上滑时恢复。
              <span className="text-destructive font-semibold">
                {' '}
                该动画可能带来较高性能消耗，建议仅在性能充足的设备开启。
              </span>
            </span>
          }
          control={
            <Switch
              checked={system.isScrollChromeAnimationEnabled}
              onCheckedChange={checked =>
                setSystemSettings({ isScrollChromeAnimationEnabled: checked })
              }
            />
          }
        />
      </SettingsSection>
      <SettingsSection
        title="TMDB 智能服务"
        description="管理影片元数据、海报与推荐内容的连接方式。"
        icon={<Film className="size-4" />}
      >
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
          control={
            <Switch
              checked={system.tmdbEnabled}
              disabled={!hasTmdbToken}
              onCheckedChange={checked => setSystemSettings({ tmdbEnabled: checked })}
            />
          }
        />
        <SettingsItem
          title="TMDB API Base URL"
          description="支持绝对地址或相对路径，留空后自动回退到环境变量或官方默认地址。"
          control={
            <div className="relative w-full sm:w-[340px]">
              <Link2 className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                type="text"
                className="pl-9"
                value={system.tmdbApiBaseUrl}
                placeholder={tmdbApiBaseUrlPlaceholder}
                onChange={e => setSystemSettings({ tmdbApiBaseUrl: e.target.value })}
              />
            </div>
          }
        />
        <SettingsItem
          title="TMDB 图片 Base URL"
          description="支持绝对地址或相对路径，留空后自动回退到环境变量或官方默认地址。"
          control={
            <div className="relative w-full sm:w-[340px]">
              <Image className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                type="text"
                className="pl-9"
                value={system.tmdbImageBaseUrl}
                placeholder={tmdbImageBaseUrlPlaceholder}
                onChange={e => setSystemSettings({ tmdbImageBaseUrl: e.target.value })}
              />
            </div>
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
