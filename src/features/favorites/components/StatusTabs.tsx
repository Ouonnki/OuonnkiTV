import { motion } from 'framer-motion'
import { FavoriteWatchStatus, type FavoriteStats } from '../types/favorites'
import { cn } from '@/shared/lib/utils'
import { Eye, CheckCircle2, Circle } from 'lucide-react'

interface StatusTabsProps {
  currentStatus: FavoriteWatchStatus | 'all'
  onStatusChange: (status: FavoriteWatchStatus | 'all') => void
  stats: FavoriteStats
}

const STATUS_CONFIG = [
  {
    key: 'all',
    label: '全部',
    icon: Circle,
  },
  {
    key: FavoriteWatchStatus.NOT_WATCHED,
    label: '未观看',
    icon: Eye,
  },
  {
    key: FavoriteWatchStatus.WATCHING,
    label: '正在看',
    icon: Eye,
  },
  {
    key: FavoriteWatchStatus.COMPLETED,
    label: '已看完',
    icon: CheckCircle2,
  },
] as const

/**
 * StatusTabs - 状态分类标签组件
 * 使用滑块动画切换效果（类似搜索模式切换）
 */
export function StatusTabs({
  currentStatus,
  onStatusChange,
  stats,
}: StatusTabsProps) {
  return (
    <div className="bg-muted relative inline-flex items-center rounded-full p-1">
      {STATUS_CONFIG.map(({ key, label, icon: Icon }) => {
        const isActive = currentStatus === key

        let count = 0
        if (key === 'all') {
          count = stats.total
        } else if (key === FavoriteWatchStatus.NOT_WATCHED) {
          count = stats.notWatchedCount
        } else if (key === FavoriteWatchStatus.WATCHING) {
          count = stats.watchingCount
        } else if (key === FavoriteWatchStatus.COMPLETED) {
          count = stats.completedCount
        }

        return (
          <button
            key={key}
            type="button"
            onClick={() => onStatusChange(key as FavoriteWatchStatus | 'all')}
            className={cn(
              'relative z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary/80',
            )}
          >
            <Icon className="size-3.5" />
            <span>{label}</span>
            {count > 0 && (
              <span
                className={cn(
                  'flex size-5 min-w-5 items-center justify-center rounded-full text-[10px] font-medium',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted-foreground/20 text-muted-foreground',
                )}
              >
                {count}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="status-tab-indicator"
                className="bg-background absolute inset-0 -z-10 rounded-full shadow-sm"
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
