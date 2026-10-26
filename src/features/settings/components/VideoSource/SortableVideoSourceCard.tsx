import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { cn } from '@/shared/lib'
import type { VideoSource } from '@ouonnki/cms-core'
import VideoSourceCard from './VideoSourceCard'

interface SortableVideoSourceCardProps {
  source: VideoSource
  onEdit: () => void
}

export default function SortableVideoSourceCard({ source, onEdit }: SortableVideoSourceCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: source.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group border-border/60 relative flex items-center gap-1 border-b px-2 last:border-b-0',
        isDragging && 'z-10 rounded-lg opacity-80 shadow-lg',
      )}
    >
      <button
        type="button"
        className={cn(
          'focus-visible:ring-ring shrink-0 cursor-grab touch-none rounded px-1 py-3 outline-none focus-visible:ring-2',
          'text-muted-foreground/40 hover:text-muted-foreground',
          'opacity-100 transition-opacity focus-visible:opacity-100 sm:opacity-40 sm:group-hover:opacity-100',
          isDragging && 'cursor-grabbing !opacity-100',
        )}
        {...attributes}
        {...listeners}
        aria-label={`调整 ${source.name} 的顺序`}
      >
        <GripVertical className="size-4" />
      </button>

      <div className="min-w-0 flex-1">
        <VideoSourceCard source={source} onEdit={onEdit} />
      </div>
    </div>
  )
}
