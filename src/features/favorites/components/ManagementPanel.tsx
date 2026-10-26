import { Edit3, CheckSquare, Square, Trash2, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/shared/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog'

export interface ManagementPanelProps {
  isOpen: boolean
  selectedCount: number
  totalCount: number
  isAllSelected: boolean
  onExit: () => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onClearAll: () => void
  onDeleteSelected: () => void
}

export function ManagementPanel({
  isOpen,
  selectedCount,
  totalCount,
  isAllSelected,
  onExit,
  onSelectAll,
  onDeselectAll,
  onClearAll,
  onDeleteSelected,
}: ManagementPanelProps) {
  return (
    <div
      className={
        isOpen
          ? 'absolute inset-x-3 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-30 md:inset-x-auto md:left-1/2 md:bottom-8 md:max-w-[calc(100%-3rem)] md:-translate-x-1/2'
          : 'absolute right-3 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-30 md:right-8 md:bottom-8'
      }
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="expanded-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="bg-background/95 border-border rounded-xl border p-3 shadow-lg backdrop-blur-md md:flex md:items-center md:gap-4"
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
                onClick={isAllSelected ? onDeselectAll : onSelectAll}
              >
                {isAllSelected ? <CheckSquare /> : <Square />}
                {isAllSelected ? '取消' : '全选'}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive h-11 min-w-0 px-2 md:h-8"
                  >
                    <XCircle />
                    清空
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent size="sm">
                  <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive">
                      <Trash2 />
                    </AlertDialogMedia>
                    <AlertDialogTitle>确认清空</AlertDialogTitle>
                    <AlertDialogDescription>
                      确定要清空当前分类下的所有收藏项吗？此操作无法撤销。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel variant="outline">取消</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={onClearAll}>
                      确认清空
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-11 min-w-0 px-2 md:h-8"
                    disabled={selectedCount === 0}
                    aria-label={`删除选中的 ${selectedCount} 个收藏`}
                  >
                    <Trash2 />
                    删除
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent size="sm">
                  <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive">
                      <Trash2 />
                    </AlertDialogMedia>
                    <AlertDialogTitle>确认删除</AlertDialogTitle>
                    <AlertDialogDescription>
                      确定要删除选中的 {selectedCount} 个收藏项吗？此操作无法撤销。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel variant="outline">取消</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={onDeleteSelected}>
                      确认删除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="collapsed-button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button
              size="lg"
              aria-label="编辑收藏"
              className="bg-background text-foreground border-border hover:bg-accent h-12 w-12 rounded-full border shadow-lg"
              onClick={onExit}
            >
              <Edit3 className="size-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
