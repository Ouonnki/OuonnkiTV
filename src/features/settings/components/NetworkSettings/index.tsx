import { Input } from '@/shared/components/ui/input'
import { CloudLightning, Layers, RefreshCw, Timer } from 'lucide-react'
import { useSettingStore } from '@/shared/store/settingStore'
import { SettingsItem, SettingsSection } from '../common'

export default function NetworkSettings() {
  const { network, setNetworkSettings } = useSettingStore()

  return (
    <SettingsSection
      title="网络设置"
      description="配置全局请求超时与失败重试策略。"
      icon={<CloudLightning className="size-4" />}
      tone="sky"
    >
      <SettingsItem
        title="默认超时时间（ms）"
        description="未单独配置超时的视频源将使用此值。"
        control={
          <div className="relative w-full sm:w-48">
            <Timer className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              type="number"
              id="timeout"
              min={300}
              step={100}
              className="pl-9"
              value={network.defaultTimeout}
              onChange={e =>
                setNetworkSettings({ defaultTimeout: Number.parseInt(e.target.value, 10) || 0 })
              }
            />
          </div>
        }
      />
      <SettingsItem
        title="默认重试次数"
        description="请求失败后自动重试的最大次数。"
        control={
          <div className="relative w-full sm:w-48">
            <RefreshCw className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              type="number"
              id="retry"
              min={0}
              max={10}
              className="pl-9"
              value={network.defaultRetry}
              onChange={e =>
                setNetworkSettings({ defaultRetry: Number.parseInt(e.target.value, 10) || 0 })
              }
            />
          </div>
        }
      />
      <SettingsItem
        title="并发请求限制"
        description="同时发出的最大搜索请求数，影响多源搜索速度。"
        control={
          <div className="relative w-full sm:w-48">
            <Layers className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              type="number"
              id="concurrency"
              min={1}
              max={10}
              className="pl-9"
              value={network.concurrencyLimit}
              onChange={e =>
                setNetworkSettings({ concurrencyLimit: Number.parseInt(e.target.value, 10) || 3 })
              }
            />
          </div>
        }
      />
    </SettingsSection>
  )
}
