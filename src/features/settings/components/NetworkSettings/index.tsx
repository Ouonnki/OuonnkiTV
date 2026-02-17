import { Input } from '@/shared/components/ui/input'
import { Switch } from '@/shared/components/ui/switch'
import { CloudLightning, Layers, Link, RefreshCw, Timer } from 'lucide-react'
import { useSettingStore } from '@/shared/store/settingStore'
import { SettingsItem, SettingsSection } from '../common'

export default function NetworkSettings() {
  const { network, setNetworkSettings } = useSettingStore()

  return (
    <SettingsSection
      title="网络设置"
      description="配置全局请求超时、重试、并发与代理策略。"
      icon={<CloudLightning className="size-4" />}
      tone="sky"
    >
      <SettingsItem
        title="启用请求代理"
        description="关闭后视频源搜索、详情与测速将直接请求源站。"
        controlClassName="self-end mt-1"
        control={
          <Switch
            checked={network.isProxyEnabled}
            onCheckedChange={checked => setNetworkSettings({ isProxyEnabled: checked })}
          />
        }
      />
      <SettingsItem
        title="代理地址"
        description="支持 /proxy?url=、完整地址，或使用 {url} 占位符。"
        control={
          <div className="relative w-full sm:w-[340px]">
            <Link className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              type="text"
              id="proxyUrl"
              className="pl-9"
              value={network.proxyUrl}
              placeholder="/proxy?url="
              onChange={e => setNetworkSettings({ proxyUrl: e.target.value })}
            />
          </div>
        }
      />
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
