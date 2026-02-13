import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FavoriteWatchStatus, type FavoriteStats } from '../types/favorites'
import { cn } from '@/shared/lib/utils'
import { EyeOff, Eye, CheckCircle2, Circle, ChevronLeft } from 'lucide-react'

interface StatusTabsProps {
  currentStatus: FavoriteWatchStatus | 'all'
  onStatusChange: (status: FavoriteWatchStatus | 'all') => void
  stats: FavoriteStats
  /** 紧凑模式：隐藏文字标签，仅显示图标和计数，按钮等宽分布 */
  compact?: boolean
  /** 可折叠模式：默认只显示当前选中 tab，点击展开全部 */
  collapsible?: boolean
  /** 折叠/展开状态变化回调 */
  onExpandedChange?: (expanded: boolean) => void
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
    icon: EyeOff,
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

/** 获取指定状态的收藏数量 */
function getStatusCount(key: string, stats: FavoriteStats): number {
  if (key === 'all') return stats.total
  if (key === FavoriteWatchStatus.NOT_WATCHED) return stats.notWatchedCount
  if (key === FavoriteWatchStatus.WATCHING) return stats.watchingCount
  if (key === FavoriteWatchStatus.COMPLETED) return stats.completedCount
  return 0
}

/**
 * StatusTabs - 状态分类标签组件
 * 支持三种模式：
 * - 默认模式：图标 + 文字 + 计数
 * - 紧凑模式（compact）：仅图标 + 计数，等宽分布
 * - 折叠模式（collapsible）：默认只显示当前 tab，可展开全部
 */
export function StatusTabs({
  currentStatus,
  onStatusChange,
  stats,
  compact = false,
  collapsible = false,
  onExpandedChange,
}: StatusTabsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggle = useCallback(() => {
    setIsExpanded(prev => {
      const next = !prev
      onExpandedChange?.(next)
      return next
    })
  }, [onExpandedChange])

  const handleStatusChange = useCallback(
    (status: FavoriteWatchStatus | 'all') => {
      onStatusChange(status)
      if (collapsible && isExpanded) {
        setIsExpanded(false)
        onExpandedChange?.(false)
      }
    },
    [onStatusChange, collapsible, isExpanded, onExpandedChange],
  )

  // 折叠模式：独立渲染路径
  if (collapsible) {
    return (
      <motion.div
        layout
        className={cn(
          'bg-muted relative flex items-center rounded-full p-1',
          isExpanded && 'w-full',
        )}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* 展开/收起按钮 */}
        <button
          type="button"
          onClick={toggle}
          className="text-muted-foreground hover:text-primary/80 z-10 flex shrink-0 items-center justify-center rounded-full px-1 py-1.5 transition-colors"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <ChevronLeft className="size-3.5" />
          </motion.div>
        </button>

        <AnimatePresence initial={false} mode="popLayout">
          {STATUS_CONFIG.map(({ key, icon: Icon }) => {
            const isActive = currentStatus === key
            const count = getStatusCount(key, stats)

            // 折叠态只显示当前选中项
            if (!isExpanded && !isActive) return null

            return (
              <motion.button
                key={key}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                type="button"
                onClick={() => {
                  if (!isExpanded) {
                    toggle()
                  } else {
                    handleStatusChange(key as FavoriteWatchStatus | 'all')
                  }
                }}
                className={cn(
                  'relative z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  isExpanded && 'flex-1 justify-center px-2',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary/80',
                )}
              >
                <Icon className="size-3.5" />
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
                    layoutId="status-tab-indicator-collapsible"
                    className="bg-background absolute inset-0 -z-10 rounded-full shadow-sm"
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
              </motion.button>
            )
          })}
        </AnimatePresence>
      </motion.div>
    )
  }

  // 默认/紧凑模式
  return (
    <div
      className={cn(
        'bg-muted relative inline-flex items-center rounded-full p-1',
        compact && 'w-full',
      )}
    >
      {STATUS_CONFIG.map(({ key, label, icon: Icon }) => {
        const isActive = currentStatus === key
        const count = getStatusCount(key, stats)

        return (
          <button
            key={key}
            type="button"
            onClick={() => onStatusChange(key as FavoriteWatchStatus | 'all')}
            className={cn(
              'relative z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              compact && 'flex-1 justify-center px-2',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary/80',
            )}
          >
            <Icon className="size-3.5" />
            {!compact && <span>{label}</span>}
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
                layoutId={compact ? 'status-tab-indicator-compact' : 'status-tab-indicator'}
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
