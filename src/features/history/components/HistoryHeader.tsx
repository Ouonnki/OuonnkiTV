import { Button } from '@/shared/components/ui/button'

interface HistoryHeaderProps {
  totalCount: number
  hasHistory: boolean
  selectionMode: boolean
  onToggleSelectionMode: () => void
}

export function HistoryHeader({
  totalCount,
  hasHistory,
  selectionMode,
  onToggleSelectionMode,
}: HistoryHeaderProps) {
  return (
    <header className="border-border bg-sidebar/80 sticky top-0 z-20 border-b backdrop-blur-md">
      <div className="flex min-h-14 flex-wrap items-center gap-2 px-4 py-1.5 md:flex-nowrap md:py-0">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <h1 className="shrink-0 text-base font-bold md:text-lg">观看历史</h1>
          <span className="text-muted-foreground hidden shrink-0 text-xs sm:inline md:text-sm">
            共 <span className="text-primary font-medium">{totalCount}</span> 项
          </span>
        </div>
        <Button
          variant={selectionMode ? 'ghost' : 'outline'}
          size="sm"
          className="h-11 min-w-11 rounded-md px-3 md:h-8"
          disabled={!hasHistory && !selectionMode}
          onClick={onToggleSelectionMode}
        >
          {selectionMode ? '完成' : '编辑'}
        </Button>
      </div>
    </header>
  )
}
