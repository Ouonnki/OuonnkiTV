import { Label } from '@/shared/components/ui/label'
import { Switch } from '@/shared/components/ui/switch'
import { useSettingStore } from '@/shared/store/settingStore'

export default function SearchSettings() {
  const { search, setSearchSettings } = useSettingStore()

  return (
    <div className="flex flex-col gap-6 px-4 md:px-0">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-gray-800">搜索设置</h1>
        <p className="text-xs text-gray-500">管理搜索历史行为</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white/40 p-4 backdrop-blur-md md:p-6">
        <h2 className="mb-4 text-sm font-medium text-gray-900">历史记录</h2>
        <div className="flex flex-col gap-6">
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">开启搜索历史</Label>
              <p className="text-sm text-gray-500">是否记录您的搜索关键词</p>
            </div>
            <Switch
              checked={search.isSearchHistoryEnabled}
              onCheckedChange={checked => setSearchSettings({ isSearchHistoryEnabled: checked })}
            />
          </div>
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">显示搜索历史</Label>
              <p className="text-sm text-gray-500">在搜索框获得焦点时显示历史记录</p>
            </div>
            <Switch
              checked={search.isSearchHistoryVisible}
              onCheckedChange={checked => setSearchSettings({ isSearchHistoryVisible: checked })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
