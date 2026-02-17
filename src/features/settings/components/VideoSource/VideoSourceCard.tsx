import { Rss, Pencil, Eye, Clock } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Switch } from '@/shared/components/ui/switch'
import { Button } from '@/shared/components/ui/button'
import { useApiStore } from '@/shared/store/apiStore'
import {
  isSubscriptionSource,
  extractSubscriptionId,
  useSubscriptionStore,
} from '@/shared/store/subscriptionStore'
import dayjs from 'dayjs'
import type { VideoSource } from '@ouonnki/cms-core'
import HealthStatusIndicator from './HealthStatusIndicator'

interface VideoSourceCardProps {
  source: VideoSource
  onEdit: () => void
}

export default function VideoSourceCard({ source, onEdit }: VideoSourceCardProps) {
  const { setApiEnabled } = useApiStore()
  const isSub = isSubscriptionSource(source.id)

  return (
    <div className="bg-muted/35 space-y-2.5 rounded-lg px-4 py-3">
      {/* 第一行：名称 + 测速(桌面端) + 操作区 */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {isSub && (
            <Rss className="size-3.5 shrink-0 text-violet-600 dark:text-violet-400" />
          )}
          <p className="truncate text-sm font-medium">{source.name}</p>
          <span className="hidden shrink-0 sm:inline-flex">
            <HealthStatusIndicator sourceId={source.id} />
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Switch
            checked={source.isEnabled}
            onCheckedChange={checked => setApiEnabled(source.id, checked)}
            onClick={e => e.stopPropagation()}
          />
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onEdit}
          >
            {isSub ? <Eye className="size-3.5" /> : <Pencil className="size-3.5" />}
          </Button>
        </div>
      </div>
      {/* 第二行：Badge + 测速(移动端) + 附加信息 */}
      <SecondaryInfo source={source} isSub={isSub} />
    </div>
  )
}

function SecondaryInfo({ source, isSub }: { source: VideoSource; isSub: boolean }) {
  const subscriptionId = isSub ? extractSubscriptionId(source.id) : null
  const subscription = useSubscriptionStore(state =>
    subscriptionId ? state.subscriptions.find(s => s.id === subscriptionId) : undefined,
  )

  return (
    <div className="text-muted-foreground flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
      {isSub ? (
        <Badge
          variant="outline"
          className="border-violet-500/30 text-violet-600 dark:text-violet-400 h-5 text-[10px]"
        >
          订阅源
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="border-sky-500/30 text-sky-600 dark:text-sky-400 h-5 text-[10px]"
        >
          自建源
        </Badge>
      )}
      {/* 移动端测速结果显示在 Badge 右侧 */}
      <span className="shrink-0 sm:hidden">
        <HealthStatusIndicator sourceId={source.id} />
      </span>
      {isSub && subscription && (
        <span className="truncate">来自「{subscription.name}」</span>
      )}
      {!isSub && source.updatedAt && (
        <span className="flex items-center gap-1">
          <Clock className="size-3" />
          {dayjs(source.updatedAt).format('MM-DD HH:mm')}
        </span>
      )}
    </div>
  )
}
