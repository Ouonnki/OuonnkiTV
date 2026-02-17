import { Rss, Lock } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Switch } from '@/shared/components/ui/switch'
import { useApiStore } from '@/shared/store/apiStore'
import {
  extractSubscriptionId,
  useSubscriptionStore,
} from '@/shared/store/subscriptionStore'
import dayjs from 'dayjs'
import type { VideoSource } from '@ouonnki/cms-core'

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
      <span className="text-muted-foreground w-20 shrink-0 text-sm">{label}</span>
      <span className="break-all text-sm">{value}</span>
    </div>
  )
}

export default function SubscriptionSourceDetail({
  source,
}: {
  source: VideoSource
}) {
  const { setApiEnabled } = useApiStore()
  const subscriptionId = extractSubscriptionId(source.id)
  const subscription = useSubscriptionStore(state =>
    state.subscriptions.find(s => s.id === subscriptionId),
  )

  return (
    <>
      <div className="border-border flex items-start justify-between gap-3 border-b pb-3">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold md:text-lg">
              {source.name}
            </h3>
            <Badge
              variant="outline"
              className="border-violet-500/30 text-violet-600 dark:text-violet-400 shrink-0 text-xs"
            >
              <Rss className="mr-1 size-3" />
              订阅源
            </Badge>
          </div>
          {subscription && (
            <p className="text-muted-foreground text-xs">
              来自订阅「{subscription.name}」
            </p>
          )}
        </div>
        <Switch
          checked={source.isEnabled}
          onCheckedChange={checked => setApiEnabled(source.id, checked)}
        />
      </div>

      <div className="mt-4 space-y-4">
        <div className="bg-muted/30 space-y-3 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
            <Lock className="size-4" />
            <span>订阅源由远程 URL 管理，不可手动编辑或删除。</span>
          </div>
        </div>

        <div className="space-y-3">
          <InfoRow label="源 ID" value={source.id} />
          <InfoRow label="搜索 URL" value={source.url} />
          {source.detailUrl && source.detailUrl !== source.url && (
            <InfoRow label="详情 URL" value={source.detailUrl} />
          )}
          <InfoRow label="超时时间" value={`${source.timeout ?? '-'} ms`} />
          <InfoRow label="重试次数" value={`${source.retry ?? '-'} 次`} />
          <InfoRow
            label="更新时间"
            value={
              source.updatedAt
                ? dayjs(source.updatedAt).format('YYYY-MM-DD HH:mm')
                : '-'
            }
          />
        </div>
      </div>
    </>
  )
}
