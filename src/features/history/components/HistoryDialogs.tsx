import { Trash2 } from 'lucide-react'
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
} from '@/shared/components/ui/alert-dialog'
import type { ViewingHistoryItem } from '@/shared/types'

interface HistoryDialogsProps {
  pendingDeleteItem: ViewingHistoryItem | null
  batchDeleteOpen: boolean
  clearAllOpen: boolean
  selectedCount: number
  onPendingDeleteChange: (item: ViewingHistoryItem | null) => void
  onBatchDeleteOpenChange: (open: boolean) => void
  onClearAllOpenChange: (open: boolean) => void
  onDeleteSingle: (item: ViewingHistoryItem) => void
  onDeleteSelected: () => void
  onClearAll: () => void
}

export function HistoryDialogs({
  pendingDeleteItem,
  batchDeleteOpen,
  clearAllOpen,
  selectedCount,
  onPendingDeleteChange,
  onBatchDeleteOpenChange,
  onClearAllOpenChange,
  onDeleteSingle,
  onDeleteSelected,
  onClearAll,
}: HistoryDialogsProps) {
  return (
    <>
      <AlertDialog
        open={pendingDeleteItem !== null}
        onOpenChange={open => {
          if (!open) onPendingDeleteChange(null)
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>确定要删除这条观看历史吗？此操作无法撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">取消</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (!pendingDeleteItem) return
                onDeleteSingle(pendingDeleteItem)
                onPendingDeleteChange(null)
              }}
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={batchDeleteOpen} onOpenChange={onBatchDeleteOpenChange}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>确认批量删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除选中的 {selectedCount} 项历史记录吗？此操作无法撤销。
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

      <AlertDialog open={clearAllOpen} onOpenChange={onClearAllOpenChange}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>确认清空历史</AlertDialogTitle>
            <AlertDialogDescription>确定要清空全部观看历史吗？此操作无法撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">取消</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onClearAll}>
              确认清空
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
