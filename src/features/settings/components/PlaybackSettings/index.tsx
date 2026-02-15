import { useSettingStore } from '@/shared/store/settingStore'
import { useApiStore } from '@/shared/store/apiStore'
import { Switch } from '@/shared/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Gauge, ListFilter, PlaySquare, Timer } from 'lucide-react'
import { SettingsItem, SettingsPageShell, SettingsSection } from '../common'

interface ToggleSettingItemProps {
  id: string
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

function ToggleSettingItem({
  id,
  title,
  description,
  checked,
  onCheckedChange,
}: ToggleSettingItemProps) {
  return (
    <div className="bg-muted/35 flex min-h-[92px] flex-col rounded-lg px-4 py-3">
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium md:text-base">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <div className="mt-2 flex justify-end">
        <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      </div>
    </div>
  )
}

export default function PlaybackSettings() {
  const { playback, setPlaybackSettings } = useSettingStore()
  const { adFilteringEnabled, setAdFilteringEnabled } = useApiStore()

  return (
    <SettingsPageShell
      title="播放设置"
      description="按你的观看习惯组合播放行为与剧集展示方式。"
      showHeader={false}
    >
      <SettingsSection
        title="播放行为"
        description="控制自动续播、观看记录和广告片段过滤。"
        icon={<PlaySquare className="size-4" />}
        tone="violet"
      >
        <ToggleSettingItem
          id="playback-viewing-history"
          title="开启观看记录"
          description="自动记录您的观看进度，便于下次续播。"
          checked={playback.isViewingHistoryEnabled}
          onCheckedChange={checked => setPlaybackSettings({ isViewingHistoryEnabled: checked })}
        />
        <ToggleSettingItem
          id="playback-viewing-progress"
          title="详情页显示观看进度"
          description="在媒体详情页展示已观看剧集与当前进度。"
          checked={playback.isViewingHistoryVisible}
          onCheckedChange={checked => setPlaybackSettings({ isViewingHistoryVisible: checked })}
        />
        <ToggleSettingItem
          id="playback-auto-play"
          title="自动续播下一集"
          description="当前一集播放完毕后自动切换到下一集。"
          checked={playback.isAutoPlayEnabled}
          onCheckedChange={checked => setPlaybackSettings({ isAutoPlayEnabled: checked })}
        />
        <ToggleSettingItem
          id="playback-ad-filtering"
          title="跳过切片广告"
          description="尝试检测并跳过 #EXT-X-DISCONTINUITY 标记的广告片段。"
          checked={adFilteringEnabled}
          onCheckedChange={checked => setAdFilteringEnabled(checked)}
        />
      </SettingsSection>

      <SettingsSection
        title="剧集展示"
        description="定义详情页剧集列表排序与信息呈现方式。"
        icon={<ListFilter className="size-4" />}
        tone="amber"
      >
        <SettingsItem
          title="剧集默认显示顺序"
          description="影响详情页剧集列表的默认排列顺序。"
          control={
            <div className="w-full sm:w-[220px]">
              <Select
                value={playback.defaultEpisodeOrder}
                onValueChange={(value: 'asc' | 'desc') =>
                  setPlaybackSettings({ defaultEpisodeOrder: value })
                }
              >
                <SelectTrigger id="order" className="w-full">
                  <SelectValue placeholder="选择顺序" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">
                    <div className="flex items-center gap-2">
                      <Gauge className="size-4" />
                      正序（1, 2, 3...）
                    </div>
                  </SelectItem>
                  <SelectItem value="desc">
                    <div className="flex items-center gap-2">
                      <Timer className="size-4" />
                      倒序（..., 3, 2, 1）
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />
      </SettingsSection>
    </SettingsPageShell>
  )
}
