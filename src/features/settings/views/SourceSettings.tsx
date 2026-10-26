import VideoSource from '../components/VideoSource'
import SubscriptionManager from '../components/VideoSource/SubscriptionManager'
import { SettingsPageShell } from '../components/common'

/**
 * SourceSettings - 视频源管理设置页
 */
export default function SourceSettings() {
  return (
    <SettingsPageShell
      title="视频源管理"
      description="管理你的内容来源。添加视频源或订阅，启用后即可用于搜索与播放。"
    >
      <VideoSource />
      <SubscriptionManager />
    </SettingsPageShell>
  )
}
