import { FavoriteWatchStatus, type FavoriteStats } from '../types/favorites'
import { UnderlineTabs } from '@/shared/components/common/UnderlineTabs'
import { cn } from '@/shared/lib'

interface StatusTabsProps {
  currentStatus: FavoriteWatchStatus | 'all'
  onStatusChange: (status: FavoriteWatchStatus | 'all') => void
  stats: FavoriteStats
}

const STATUS_CONFIG = [
  {
    key: 'all',
    label: '全部',
    dotClass: 'bg-zinc-400',
  },
  {
    key: FavoriteWatchStatus.NOT_WATCHED,
    label: '未观看',
    dotClass: 'bg-sky-500',
  },
  {
    key: FavoriteWatchStatus.WATCHING,
    label: '正在看',
    dotClass: 'bg-amber-500',
  },
  {
    key: FavoriteWatchStatus.COMPLETED,
    label: '已看完',
    dotClass: 'bg-emerald-500',
  },
] as const

/** 获取指定状态的收藏数量 */
function getStatusCount(key: string, stats: FavoriteStats): number {
  if (key === 'all') return stats.total
  if (key === FavoriteWatchStatus.NOT_WATCHED) return stats.notWatchedCount
  if (key === FavoriteWatchStatus.WATCHING) return stats.watchingCount
  if (key === FavoriteWatchStatus.COMPLETED) return stats.completedCount
  return 0
}

export function StatusTabs({ currentStatus, onStatusChange, stats }: StatusTabsProps) {
  const options = STATUS_CONFIG.map(({ key, label, dotClass }) => {
    const count = getStatusCount(key, stats)
    const isActive = currentStatus === key

    return {
      key: key as FavoriteWatchStatus | 'all',
      label: (
        <>
          <span className={cn('inline-block size-1.5 rounded-full', dotClass)} />
          <span>{label}</span>
          {count > 0 ? (
            <span
              className={cn(
                'flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-medium',
                isActive
                  ? 'bg-foreground text-background'
                  : 'bg-muted-foreground/20 text-muted-foreground',
              )}
            >
              {count}
            </span>
          ) : null}
        </>
      ),
      indicatorClassName: dotClass,
    }
  })

  return (
    <UnderlineTabs
      options={options}
      activeKey={currentStatus}
      onChange={onStatusChange}
      layoutId="favorites-status-tab-underline"
      listClassName="border-b border-transparent"
      leftEdgeClassName="from-sidebar via-sidebar/72 to-transparent"
      rightEdgeClassName="from-sidebar via-sidebar/72 to-transparent"
    />
  )
}
