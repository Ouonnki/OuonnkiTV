import { Play } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { MouseEvent } from 'react'
import { NavLink } from 'react-router'
import { AspectRatio } from '@/shared/components/ui/aspect-ratio'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Progress } from '@/shared/components/ui/progress'
import { cn } from '@/shared/lib/utils'
import { buildCmsPlayPath } from '@/shared/lib/routes'
import type { ViewingHistoryItem } from '@/shared/types'

interface ViewingHistoryCardProps {
  item: ViewingHistoryItem
  className?: string
  selectionMode?: boolean
  selected?: boolean
  onToggleSelect?: (item: ViewingHistoryItem) => void
}

const getPlayPath = (item: ViewingHistoryItem) =>
  buildCmsPlayPath(item.sourceCode, item.vodId, item.episodeIndex)

const getProgressValue = (item: ViewingHistoryItem) => {
  if (item.duration <= 0) return 0
  return Math.min(100, Math.max(0, (item.playbackPosition / item.duration) * 100))
}

const getEpisodeLabel = (item: ViewingHistoryItem) => item.episodeName || `第${item.episodeIndex + 1}集`

export function ViewingHistoryCard({
  item,
  className,
  selectionMode = false,
  selected = false,
  onToggleSelect,
}: ViewingHistoryCardProps) {
  const handleSelect = () => {
    onToggleSelect?.(item)
  }

  const handleCardClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!selectionMode) return
    event.preventDefault()
    handleSelect()
  }

  const cardContent = (
    <div
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-lg',
        selected && 'ring-primary ring-offset-background ring-2 ring-offset-2',
      )}
    >
      {selectionMode && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute top-2 right-2 z-20"
          >
            <Checkbox
              checked={selected}
              onCheckedChange={handleSelect}
              onClick={event => event.stopPropagation()}
              className="bg-background/80 border-white/70 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground shadow-sm"
            />
          </motion.div>
        </AnimatePresence>
      )}

      <AspectRatio ratio={1.778}>
        <img
          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
          src={item.imageUrl}
          alt={item.title}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6 transition-opacity duration-300 group-hover:opacity-0">
          <span className="line-clamp-1 text-sm font-medium text-white">{item.title}</span>
        </div>
      </AspectRatio>

      <Progress
        className="h-1 transition-opacity duration-300 group-hover:opacity-0 [&>*]:bg-red-600 dark:[&>*]:bg-red-800"
        value={getProgressValue(item)}
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex size-12 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
          <Play className="size-6 fill-current" />
        </div>
      </div>

      <span className="pointer-events-none absolute top-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {getEpisodeLabel(item)}
      </span>
    </div>
  )

  return (
    <NavLink
      to={getPlayPath(item)}
      className={cn('block', className)}
      onClick={handleCardClick}
      aria-pressed={selectionMode ? selected : undefined}
    >
      {cardContent}
    </NavLink>
  )
}
