import { Switch } from '@/shared/components/ui/switch'
import { Input } from '@/shared/components/ui/input'
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
      tone="emerald"
    >
      <SettingsItem
        title="开启搜索历史"
        description="记录你的搜索关键词，用于快捷回填。"
        controlClassName="self-end mt-1"
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
        controlClassName="self-end mt-1"
        control={
          <Switch
            checked={search.isSearchHistoryVisible}
            onCheckedChange={checked => setSearchSettings({ isSearchHistoryVisible: checked })}
          />
        }
      />
      <SettingsItem
        title="搜索历史上限"
        description="最多保留的搜索历史条数，超出后自动清除最早的记录。"
        control={
          <div className="w-full sm:w-48">
            <Input
              type="number"
              min={5}
              max={100}
              step={5}
              value={search.maxSearchHistoryCount}
              onChange={e =>
                setSearchSettings({
                  maxSearchHistoryCount: Number.parseInt(e.target.value, 10) || 20,
                })
              }
            />
          </div>
        }
      />
    </SettingsSection>
  )
}
