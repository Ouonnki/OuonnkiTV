import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSettingStore } from '@/store/settingStore'

export default function NetworkSettings() {
  const { network, setNetworkSettings } = useSettingStore()

  return (
    <div className="flex flex-col gap-6 px-4 md:px-0">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-gray-800">网络设置</h1>
        <p className="text-xs text-gray-500">配置全局的网络请求默认参数</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white/40 p-4 backdrop-blur-md md:p-6">
        <div className="flex flex-col gap-6">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="timeout">默认超时时间 (ms)</Label>
            <Input
              type="number"
              id="timeout"
              value={network.defaultTimeout}
              onChange={e => setNetworkSettings({ defaultTimeout: parseInt(e.target.value) || 0 })}
            />
            <p className="text-xs text-gray-500">所有没有单独设置超时时间的视频源将使用此默认值</p>
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="retry">默认重试次数</Label>
            <Input
              type="number"
              id="retry"
              value={network.defaultRetry}
              onChange={e => setNetworkSettings({ defaultRetry: parseInt(e.target.value) || 0 })}
            />
            <p className="text-xs text-gray-500">请求失败时的自动重试次数</p>
          </div>
        </div>
      </div>
    </div>
  )
}
