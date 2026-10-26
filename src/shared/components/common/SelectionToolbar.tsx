import { AnimatePresence, motion } from 'framer-motion'
import { CheckSquare, Square, Trash2, XCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import type { MouseEvent } from 'react'

export interface SelectionToolbarProps {
  isOpen: boolean
  selectedCount: number
  totalCount: number
  isAllSelected: boolean
  onExit: () => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onClearAll: (event?: MouseEvent<HTMLButtonElement>) => void
  onDeleteSelected: (event?: MouseEvent<HTMLButtonElement>) => void
}

export function SelectionToolbar({
  isOpen,
  selectedCount,
  totalCount,
  isAllSelected,
  onExit,
  onSelectAll,
  onDeselectAll,
  onClearAll,
  onDeleteSelected,
}: SelectionToolbarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          aria-label="批量操作"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          className="bg-background/95 border-border absolute inset-x-3 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-30 rounded-xl border p-3 shadow-lg backdrop-blur-md md:inset-x-auto md:bottom-8 md:left-1/2 md:flex md:max-w-[calc(100%-3rem)] md:-translate-x-1/2 md:items-center md:gap-4"
        >
          <div className="mb-2 flex min-w-0 items-center justify-between gap-3 md:mb-0">
            <span
              role="status"
              className="text-muted-foreground text-xs whitespace-nowrap tabular-nums"
            >
              已选择 {selectedCount}/{totalCount}
            </span>
            <Button variant="ghost" size="sm" className="h-11 min-w-11 md:h-8" onClick={onExit}>
              完成
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2 md:flex">
            <Button
              variant="outline"
              size="sm"
              className="h-11 min-w-0 px-2 md:h-8"
              disabled={totalCount === 0}
              aria-label={isAllSelected ? '取消全选' : '全选'}
              onClick={isAllSelected ? onDeselectAll : onSelectAll}
            >
              {isAllSelected ? <CheckSquare /> : <Square />}
              {isAllSelected ? '取消' : '全选'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive h-11 min-w-0 px-2 md:h-8"
              disabled={totalCount === 0}
              onClick={onClearAll}
            >
              <XCircle />
              清空
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-11 min-w-0 px-2 md:h-8"
              disabled={selectedCount === 0}
              aria-label={`删除选中的 ${selectedCount} 项`}
              onClick={onDeleteSelected}
            >
              <Trash2 />
              删除
            </Button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
