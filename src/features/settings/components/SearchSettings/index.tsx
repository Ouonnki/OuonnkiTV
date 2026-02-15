import { Switch } from '@/shared/components/ui/switch'
import { Search } from 'lucide-react'
import { useSettingStore } from '@/shared/store/settingStore'
import { SettingsItem, SettingsSection } from '../common'

export default function SearchSettings() {
  const { search, setSearchSettings } = useSettingStore()

  return (
    <SettingsSection
      title="搜索设置"
      description="管理关键词历史记录与搜索入口体验。"
      icon={<Search className="size-4" />}
    >
      <SettingsItem
        title="开启搜索历史"
        description="记录你的搜索关键词，用于快捷回填。"
        control={
          <Switch
            checked={search.isSearchHistoryEnabled}
            onCheckedChange={checked => setSearchSettings({ isSearchHistoryEnabled: checked })}
          />
        }
      />
      <SettingsItem
        title="显示搜索历史"
        description="在搜索框聚焦时展示历史关键词。"
        control={
          <Switch
            checked={search.isSearchHistoryVisible}
            onCheckedChange={checked => setSearchSettings({ isSearchHistoryVisible: checked })}
          />
        }
      />
    </SettingsSection>
  )
}
