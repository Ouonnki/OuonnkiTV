import { useState } from 'react'
import { badgeVariants } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'

interface SourceStatusBadgeProps {
  /** 已完成的源数量 */
  completed: number
  /** 总源数量 */
  total: number
  /** 成功返回结果的源 ID 集合 */
  successfulSources?: Set<string>
  /** 结果数量 */
  resultsCount: number
  /** 是否正在加载 */
  loading?: boolean
}

/**
 * 计算源完成状态指示器颜色
 */
function getIndicatorColor(successfulCount: number, total: number): string {
  // 红色：没有任何源成功
  if (successfulCount === 0) {
    return 'bg-red-500'
  }
  // 绿色：全部源成功
  if (successfulCount >= total) {
    return 'bg-green-500'
  }
  // 黄色：有源成功，但也有源失败
  return 'bg-amber-500'
}

/**
 * SourceStatusBadge - 源状态徽章组件
 *
 * 显示搜索进度和源状态的徽章，支持 hover 显示详情
 */
export function SourceStatusBadge({
  completed,
  total,
  successfulSources,
  resultsCount,
  loading = false,
}: SourceStatusBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const successfulCount = successfulSources?.size || 0
  const isCompleted = completed === total
  const indicatorColor = getIndicatorColor(successfulCount, total)

  return (
    <>
      <div className="relative ml-auto group">
        <button
          type="button"
          className={cn(
            badgeVariants({ variant: 'outline' }),
            'gap-1.5 transition-colors cursor-pointer select-none',
            loading && completed < total && 'animate-pulse'
          )}
          onClick={(e) => {
            e.stopPropagation()
            if (isCompleted) {
              setShowTooltip(!showTooltip)
            }
          }}
          aria-expanded={isCompleted ? showTooltip : undefined}
          aria-label={`已请求 ${completed}/${total} 个源`}
          title={`已请求 ${completed}/${total} 个源`}
        >
          {/* 状态指示器 - 根据完成状态显示不同颜色 */}
          {completed < total ? (
            // 搜索中：原本颜色 + ping 动画
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
          ) : (
            // 搜索完成：根据结果显示颜色（无动画）
            <span className={cn('h-1.5 w-1.5 rounded-full', indicatorColor)} />
          )}
          {completed}/{total} 源
        </button>

        {/* Tooltip：桌面端 hover 显示，移动端/平板点击显示 */}
        {isCompleted && (
          <div
            className={cn(
              'absolute right-0 top-full mt-1 z-50 transition-all duration-200',
              // 始终渲染，通过 opacity 和 pointer-events 控制显示
              showTooltip || 'group-hover:opacity-100 group-hover:pointer-events-auto',
              showTooltip ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
              // 动画类
              'animate-in fade-in-0 duration-200 zoom-in-95 slide-in-from-top-1 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-top-1'
            )}
            data-state={showTooltip ? 'open' : 'closed'}
          >
            {/* 添加一个透明的桥接区域，连接 Badge 和 Tooltip */}
            <div className="absolute bottom-full left-0 right-0 h-2" />
            <div className="bg-popover/95 backdrop-blur-sm text-popover-foreground border rounded-lg shadow-xl p-3 min-w-[200px]">
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">总源数</span>
                  <span className="font-medium">{total}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">成功</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {successfulCount}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">失败</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {total - successfulCount}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 pt-1 border-t">
                  <span className="text-muted-foreground">结果数</span>
                  <span className="font-medium">{resultsCount}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 点击/触摸外部关闭 Tooltip 的遮罩 */}
      {showTooltip && isCompleted && (
        <div
          className="fixed inset-0 z-40"
          onTouchStart={() => setShowTooltip(false)}
          onClick={() => setShowTooltip(false)}
        />
      )}
    </>
  )
}
