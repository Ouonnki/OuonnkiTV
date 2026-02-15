import NetworkSettings from '../components/NetworkSettings'
import SearchSettings from '../components/SearchSettings'
import ThemeSettings from '../components/ThemeSettings'
import { useSettingStore } from '@/shared/store/settingStore'
import { Switch } from '@/shared/components/ui/switch'
import { BellRing, Cog } from 'lucide-react'
import { SettingsItem, SettingsPageShell, SettingsSection } from '../components/common'

/**
 * SystemSettings - 系统设置页
 * 合并网络、搜索、主题设置
 */
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
          control={
            <div className="flex items-center gap-2">
              <BellRing className="text-muted-foreground size-4" />
              <Switch
                checked={system.isUpdateLogEnabled}
                onCheckedChange={checked => setSystemSettings({ isUpdateLogEnabled: checked })}
              />
            </div>
          }
        />
      </SettingsSection>
    </SettingsPageShell>
  )
}
