import { cn } from '@/shared/lib'
import { Loader2 } from 'lucide-react'
import { useHealthStore, type HealthStatus } from '@/shared/store/healthStore'

interface SubscriptionHealthBadgeProps {
  subscriptionId: string
}

const STATUS_COLORS: Record<HealthStatus, string> = {
  idle: '',
  testing: '',
  online: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
  offline: 'border-red-500/30 text-red-600 dark:text-red-400',
  timeout: 'border-amber-500/30 text-amber-600 dark:text-amber-400',
  error: 'border-red-500/30 text-red-600 dark:text-red-400',
}

const STATUS_LABELS: Record<HealthStatus, string> = {
  idle: '',
  testing: '检测中',
  online: '可达',
  offline: '不可达',
  timeout: '超时',
  error: '异常',
}

export default function SubscriptionHealthBadge({
  subscriptionId,
}: SubscriptionHealthBadgeProps) {
  const healthKey = `subscription:${subscriptionId}`
  const result = useHealthStore(state => state.results[healthKey])

  if (!result || result.status === 'idle') return null

  if (result.status === 'testing') {
    return <Loader2 className="text-muted-foreground size-3 shrink-0 animate-spin" />
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs',
        STATUS_COLORS[result.status],
      )}
    >
      {STATUS_LABELS[result.status]}
      {result.latency !== null && <span className="tabular-nums">{result.latency}ms</span>}
    </span>
  )
}
