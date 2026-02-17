import { cn } from '@/shared/lib'
import { Loader2 } from 'lucide-react'
import { useHealthStore, type HealthStatus } from '@/shared/store/healthStore'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/shared/components/ui/tooltip'

interface HealthStatusIndicatorProps {
  sourceId: string
}

const STATUS_DOT_COLORS: Record<HealthStatus, string> = {
  idle: '',
  testing: '',
  online: 'bg-emerald-500',
  offline: 'bg-red-500',
  timeout: 'bg-amber-500',
  error: 'bg-red-500',
}

const STATUS_TEXT_COLORS: Record<HealthStatus, string> = {
  idle: '',
  testing: '',
  online: '',
  offline: 'text-red-600 dark:text-red-400',
  timeout: 'text-amber-600 dark:text-amber-400',
  error: 'text-red-600 dark:text-red-400',
}

const STATUS_LABELS: Record<HealthStatus, string> = {
  idle: '',
  testing: '检测中',
  online: '',
  offline: '离线',
  timeout: '超时',
  error: '错误',
}

function latencyColor(ms: number) {
  if (ms < 500) return 'text-emerald-600 dark:text-emerald-400'
  if (ms < 1500) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function latencyDotColor(ms: number) {
  if (ms < 500) return 'bg-emerald-500'
  if (ms < 1500) return 'bg-amber-500'
  return 'bg-red-500'
}

export default function HealthStatusIndicator({ sourceId }: HealthStatusIndicatorProps) {
  const result = useHealthStore(state => state.results[sourceId])

  if (!result || result.status === 'idle') return null

  if (result.status === 'testing') {
    return <Loader2 className="text-muted-foreground size-3 shrink-0 animate-spin" />
  }

  // online 时圆点颜色跟随延迟分档
  const dotColor =
    result.status === 'online' && result.latency !== null
      ? latencyDotColor(result.latency)
      : STATUS_DOT_COLORS[result.status]

  const tooltipText =
    result.latency !== null
      ? `${result.latency}ms`
      : result.errorMessage || STATUS_LABELS[result.status]

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex shrink-0 items-center gap-1">
          <span className={cn('inline-block size-1.5 rounded-full', dotColor)} />
          {result.status === 'online' && result.latency !== null ? (
            <span className={cn('text-xs tabular-nums', latencyColor(result.latency))}>
              {result.latency}ms
            </span>
          ) : (
            <span className={cn('text-xs', STATUS_TEXT_COLORS[result.status])}>
              {STATUS_LABELS[result.status]}
            </span>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">{tooltipText}</TooltipContent>
    </Tooltip>
  )
}
