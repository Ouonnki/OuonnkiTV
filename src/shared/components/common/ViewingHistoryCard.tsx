import { Play } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { MouseEvent } from 'react'
import { NavLink } from 'react-router'
import { AspectRatio } from '@/shared/components/ui/aspect-ratio'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Progress } from '@/shared/components/ui/progress'
import { cn } from '@/shared/lib/utils'
import { buildHistoryPlayPath, isTmdbHistoryItem } from '@/shared/lib/viewingHistory'
import type { ViewingHistoryItem } from '@/shared/types'

interface ViewingHistoryCardProps {
  item: ViewingHistoryItem
  className?: string
  selectionMode?: boolean
  selected?: boolean
  mobileListLayout?: boolean
  onToggleSelect?: (item: ViewingHistoryItem) => void
}

const getPlayPath = (item: ViewingHistoryItem) => buildHistoryPlayPath(item)

const getProgressValue = (item: ViewingHistoryItem) => {
  if (item.duration <= 0) return 0
  return Math.min(100, Math.max(0, (item.playbackPosition / item.duration) * 100))
}

const formatProgressTime = (seconds: number) => {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const remainingSeconds = safeSeconds % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

const formatHistoryTimestamp = (timestamp: number) => {
  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hour}:${minute}`
}

const getEpisodeLabel = (item: ViewingHistoryItem) => item.episodeName || `第${item.episodeIndex + 1}集`
const getRecordTypeLabel = (item: ViewingHistoryItem) => (isTmdbHistoryItem(item) ? 'TMDB' : 'CMS')
const getSourceLabel = (item: ViewingHistoryItem) => item.sourceName || item.sourceCode || '未知源'

export function ViewingHistoryCard({
  item,
  className,
  selectionMode = false,
  selected = false,
  mobileListLayout = false,
  onToggleSelect,
}: ViewingHistoryCardProps) {
  const progressValue = getProgressValue(item)
  const progressPercentLabel = `${Math.round(progressValue)}%`
  const progressDetailLabel = `${formatProgressTime(item.playbackPosition)} / ${formatProgressTime(item.duration)}`
  const timestampLabel = formatHistoryTimestamp(item.timestamp)

  const handleSelect = () => {
    onToggleSelect?.(item)
  }

  const handleCardClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!selectionMode) return
    event.preventDefault()
    handleSelect()
  }

  const posterCardContent = (
    <div
      className={cn(
        selectionMode
          ? 'relative cursor-pointer overflow-hidden rounded-lg'
          : 'group relative cursor-pointer overflow-hidden rounded-lg',
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
        <div className="pointer-events-none absolute top-2 left-2 flex max-w-[82%] items-center gap-1 transition-opacity duration-300 group-hover:opacity-0">
          <span className="rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white">
            {getRecordTypeLabel(item)}
          </span>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6 transition-opacity duration-300 group-hover:opacity-0">
          <span className="line-clamp-1 text-sm font-medium text-white">{item.title}</span>
        </div>
      </AspectRatio>

      <Progress
        className="h-1 transition-opacity duration-300 group-hover:opacity-0 [&>*]:bg-red-600 dark:[&>*]:bg-red-800"
        value={progressValue}
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex size-12 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
          <Play className="size-6 fill-current" />
        </div>
      </div>

      {!selectionMode ? (
        <div className="pointer-events-none absolute top-2 right-2 flex max-w-[82%] items-center gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="max-w-[56%] truncate rounded bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white">
            {getSourceLabel(item)}
          </span>
          <span className="rounded bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white">
            {getEpisodeLabel(item)}
          </span>
        </div>
      ) : null}

      {!selectionMode ? (
        <div className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/65 px-2 py-1 text-[11px] text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="font-semibold">已观看 {progressPercentLabel}</span>
          <span className="text-white/80">{progressDetailLabel}</span>
        </div>
      ) : null}
    </div>
  )

  const mobileListCardContent = (
    <div
      className={cn(
        selectionMode
          ? 'relative cursor-pointer overflow-hidden rounded-lg border border-border/50 bg-card'
          : 'relative cursor-pointer overflow-hidden rounded-lg border border-border/50 bg-card',
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

      <div className="flex items-start gap-2.5 p-2">
        <div className="relative w-[50%] shrink-0 overflow-hidden rounded-md">
          <AspectRatio ratio={16 / 9}>
            <img className="h-full w-full object-cover" src={item.imageUrl} alt={item.title} />
            <div className="pointer-events-none absolute right-1 bottom-1 rounded bg-black/65 px-1.5 py-0.5 text-[10px] text-white">
              {progressDetailLabel}
            </div>
            <Progress
              className="absolute inset-x-0 bottom-0 z-10 h-1 rounded-none [&>*]:bg-red-600 dark:[&>*]:bg-red-800"
              value={progressValue}
            />
          </AspectRatio>
        </div>

        <div className="flex min-h-full min-w-0 flex-1 flex-col justify-between py-0.5">
          <div className="line-clamp-1 overflow-hidden text-sm font-semibold leading-5">
            {item.title}
          </div>

          <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <span className="max-w-[52%] truncate rounded bg-muted px-1.5 py-0.5">
              {getSourceLabel(item)}
            </span>
            <span className="rounded bg-muted px-1.5 py-0.5">{getEpisodeLabel(item)}</span>
          </div>

          <div className="mt-1 text-[11px] text-muted-foreground">{timestampLabel}</div>
        </div>
      </div>
    </div>
  )

  return (
    <NavLink
      to={getPlayPath(item)}
      className={cn('block', className)}
      onClick={handleCardClick}
      aria-pressed={selectionMode ? selected : undefined}
    >
      {mobileListLayout ? (
        <>
          <div className="md:hidden">{mobileListCardContent}</div>
          <div className="hidden md:block">{posterCardContent}</div>
        </>
      ) : (
        posterCardContent
      )}
    </NavLink>
  )
}
