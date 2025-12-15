import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useSettingStore } from '@/store/settingStore'
import { useSearchStore } from '@/store/searchStore'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

export default function SearchSettings() {
  const { search, setSearchSettings } = useSettingStore()
  const { clearSearchResultsCache, searchResultsCache, removeSearchResultsCacheItem } =
    useSearchStore()

  const handleClearCache = () => {
    clearSearchResultsCache()
    toast.success('搜索缓存已清空')
  }

  return (
    <div className="flex flex-col gap-6 px-4 md:px-0">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-gray-800">搜索设置</h1>
        <p className="text-xs text-gray-500">管理搜索历史和缓存行为</p>
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

      <div className="rounded-lg border border-gray-200 bg-white/40 p-4 backdrop-blur-md md:p-6">
        <h2 className="mb-4 text-sm font-medium text-gray-900">缓存管理</h2>
        <div className="flex flex-col gap-6">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="expiry">缓存过期时间 (小时)</Label>
            <Input
              type="number"
              id="expiry"
              value={search.searchCacheExpiryHours}
              onChange={e => {
                const val = parseFloat(e.target.value)
                setSearchSettings({ searchCacheExpiryHours: isNaN(val) ? 0 : val })
              }}
            />
            <p className="text-xs text-gray-500">超过此时间的搜索结果缓存将被自动清除</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">手动清理缓存</Label>
              <p className="text-sm text-gray-500">立即清空所有搜索结果缓存</p>
            </div>
            <Button variant="destructive" size="sm" onClick={handleClearCache}>
              <Trash2 className="mr-2 h-4 w-4" />
              清空缓存
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-base">缓存列表</Label>
            <div className="flex max-h-40 flex-col gap-2 overflow-y-auto rounded-md border bg-white/50 p-2">
              {Object.keys(searchResultsCache).length === 0 ? (
                <p className="text-center text-xs text-gray-400">暂无缓存</p>
              ) : (
                Object.entries(searchResultsCache).map(([query, cache]) => (
                  <div
                    key={query}
                    className="flex items-center justify-between rounded-md bg-white/60 px-3 py-2 text-sm shadow-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{query}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(cache.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => removeSearchResultsCacheItem(query)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
