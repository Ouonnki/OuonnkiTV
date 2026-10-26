import type { ReactNode } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib'

export function SearchHistoryDeleteButton({
  content,
  onDelete,
  className,
  children,
}: {
  content: string
  onDelete: () => void
  className?: string
  children?: ReactNode
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      aria-label={`删除搜索历史：${content}`}
      title={`删除 ${content}`}
      className={cn(
        'text-muted-foreground hover:text-destructive size-11 shrink-0 p-2 opacity-100 group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100 md:size-8 [@media(hover:hover)_and_(pointer:fine)]:opacity-0',
        className,
      )}
      onMouseDown={event => event.preventDefault()}
      onKeyDown={event => event.stopPropagation()}
      onClick={event => {
        event.stopPropagation()
        onDelete()
      }}
    >
      {children ?? <Trash2 className="size-4" />}
    </Button>
  )
}
