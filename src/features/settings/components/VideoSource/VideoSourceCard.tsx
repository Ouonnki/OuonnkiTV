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
import { cn } from '@/shared/lib'
import dayjs from 'dayjs'
import type { VideoSource } from '@ouonnki/cms-core'

interface VideoSourceCardProps {
  source: VideoSource
  onEdit: () => void
}

export default function VideoSourceCard({ source, onEdit }: VideoSourceCardProps) {
  const { setApiEnabled } = useApiStore()
  const isSub = isSubscriptionSource(source.id)

  return (
    <div className="bg-muted/35 space-y-2 rounded-lg px-4 py-3">
      {/* 第一行：名称 + 操作区 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {isSub && (
            <Rss className="size-4 shrink-0 text-violet-600 dark:text-violet-400" />
          )}
          <p className="truncate text-sm font-medium">{source.name}</p>
          {isSub && (
            <Badge
              variant="outline"
              className="border-violet-500/30 text-violet-600 dark:text-violet-400 shrink-0 text-xs"
            >
              订阅源
            </Badge>
          )}
          {!isSub && (
            <span
              className={cn(
                'inline-block size-1.5 shrink-0 rounded-full',
                source.isEnabled ? 'bg-emerald-500' : 'bg-zinc-400',
              )}
            />
          )}
        </div>
        <div className="flex items-center gap-1">
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
      {/* 第二行：URL + 附加信息 */}
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
    <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
      <span className="max-w-xs truncate">{source.url}</span>
      {isSub && subscription && (
        <span>来自订阅「{subscription.name}」</span>
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
