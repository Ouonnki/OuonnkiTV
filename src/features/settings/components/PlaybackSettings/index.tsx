import { useSettingStore } from '@/store/settingStore'
import { useApiStore } from '@/store/apiStore'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function PlaybackSettings() {
  const { playback, setPlaybackSettings } = useSettingStore()
  const { adFilteringEnabled, setAdFilteringEnabled } = useApiStore()

  return (
    <div className="flex flex-col gap-6 px-4 md:px-0">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-gray-800">播放设置</h1>
        <p className="text-xs text-gray-500">自定义播放体验和观看习惯</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white/40 p-4 backdrop-blur-md md:p-6">
        <h2 className="mb-4 text-sm font-medium text-gray-900">通用</h2>
        <div className="flex flex-col gap-6">
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">开启观看记录</Label>
              <p className="text-sm text-gray-500">自动记录您的观看进度</p>
            </div>
            <Switch
              checked={playback.isViewingHistoryEnabled}
              onCheckedChange={checked => setPlaybackSettings({ isViewingHistoryEnabled: checked })}
            />
          </div>

          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">自动续播</Label>
              <p className="text-sm text-gray-500">这一集播放完后自动播放下一集</p>
            </div>
            <Switch
              checked={playback.isAutoPlayEnabled}
              onCheckedChange={checked => setPlaybackSettings({ isAutoPlayEnabled: checked })}
            />
          </div>

          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">跳过切片广告</Label>
              <p className="text-sm text-gray-500">
                尝试检测并跳过 #EXT-X-DISCONTINUITY 标记的广告片段
              </p>
            </div>
            <Switch
              checked={adFilteringEnabled}
              onCheckedChange={checked => setAdFilteringEnabled(checked)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white/40 p-4 backdrop-blur-md md:p-6">
        <h2 className="mb-4 text-sm font-medium text-gray-900">显示</h2>
        <div className="flex flex-row items-center justify-between gap-1.5">
          <div className="space-y-0.5">
            <Label htmlFor="order">剧集默认显示顺序</Label>
            <p className="text-xs text-gray-500">详情页剧集列表的默认排列顺序</p>
          </div>
          <div className="w-[180px]">
            <Select
              value={playback.defaultEpisodeOrder}
              onValueChange={(value: 'asc' | 'desc') =>
                setPlaybackSettings({ defaultEpisodeOrder: value })
              }
            >
              <SelectTrigger id="order">
                <SelectValue placeholder="选择顺序" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">正序 (1, 2, 3...)</SelectItem>
                <SelectItem value="desc">倒序 (..., 3, 2, 1)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
