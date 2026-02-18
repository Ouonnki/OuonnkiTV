import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/shared/components/ui/button'

interface HistoryHeaderProps {
  totalCount: number
  hasHistory: boolean
  selectionMode: boolean
  selectedCount: number
  isAllSelected: boolean
  actionDirection: number
  onToggleSelectionMode: () => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onOpenBatchDelete: () => void
  onOpenClearAll: () => void
}

const ACTION_TRANSITION_VARIANTS = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 24 : -24,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -24 : 24,
  }),
}

export function HistoryHeader({
  totalCount,
  hasHistory,
  selectionMode,
  selectedCount,
  isAllSelected,
  actionDirection,
  onToggleSelectionMode,
  onSelectAll,
  onDeselectAll,
  onOpenBatchDelete,
  onOpenClearAll,
}: HistoryHeaderProps) {
  const actionButtonClass = 'shrink-0 rounded-xl px-2 md:h-8 md:px-3 md:text-sm'

  const renderEditingActions = () => (
    <div className="flex shrink-0 items-center gap-1">
      <Button
        variant="outline"
        size="xs"
        className={actionButtonClass}
        onClick={isAllSelected ? onDeselectAll : onSelectAll}
      >
        {isAllSelected ? '取消' : '全选'}
      </Button>

      <Button
        variant="destructive"
        size="xs"
        className={actionButtonClass}
        disabled={selectedCount === 0}
        onClick={onOpenBatchDelete}
      >
        删除({selectedCount})
      </Button>

      <Button variant="ghost" size="xs" className={actionButtonClass} onClick={onToggleSelectionMode}>
        完成
      </Button>
    </div>
  )

  const renderDefaultActions = () => (
    <div className="flex shrink-0 items-center gap-1">
      <Button variant="outline" size="xs" className={actionButtonClass} onClick={onToggleSelectionMode}>
        编辑
      </Button>
      <Button
        variant="ghost"
        size="xs"
        className="text-destructive hover:text-destructive hover:bg-transparent dark:hover:bg-transparent shrink-0 rounded-xl px-2 md:px-3"
        disabled={!hasHistory}
        onClick={onOpenClearAll}
      >
        清空
      </Button>
    </div>
  )

  return (
    <header className="border-border bg-sidebar/80 sticky top-0 z-20 border-b backdrop-blur-md">
      <div className="flex h-14 items-center gap-2 px-4">
        <div className="flex min-w-0 shrink items-center gap-2">
          <h1 className="shrink-0 text-base font-bold md:text-lg">观看历史</h1>
          <span className="text-muted-foreground hidden shrink-0 text-xs sm:inline md:text-sm">
            共 <span className="text-primary font-medium">{totalCount}</span> 项
          </span>
        </div>

        <div className="ml-auto relative shrink-0">
          <div className="invisible pointer-events-none" aria-hidden>
            {renderEditingActions()}
          </div>

          <AnimatePresence mode="sync" initial={false} custom={actionDirection}>
            {selectionMode ? (
              <motion.div
                key="editing-actions"
                custom={actionDirection}
                variants={ACTION_TRANSITION_VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute inset-y-0 right-0 flex items-center"
              >
                {renderEditingActions()}
              </motion.div>
            ) : (
              <motion.div
                key="default-actions"
                custom={actionDirection}
                variants={ACTION_TRANSITION_VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute inset-y-0 right-0 flex items-center"
              >
                {renderDefaultActions()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
