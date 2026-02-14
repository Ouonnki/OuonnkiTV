import { ArrowDownUp, ArrowUpDown } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import type { EpisodePageItem } from '@/features/player/hooks'

interface EpisodeRange {
  label: string
  value: string
}

interface PlayerEpisodePanelProps {
  totalEpisodes: number
  selectedEpisode: number
  isReversed: boolean
  onToggleOrder: () => void
  pageRanges: EpisodeRange[]
  currentPageRange: string
  onPageRangeChange: (value: string) => void
  episodes: EpisodePageItem[]
  onEpisodeSelect: (displayIndex: number) => void
  compact?: boolean
  fillHeight?: boolean
  hideHeader?: boolean
  className?: string
}

export function PlayerEpisodePanel({
  totalEpisodes,
  selectedEpisode,
  isReversed,
  onToggleOrder,
  pageRanges,
  currentPageRange,
  onPageRangeChange,
  episodes,
  onEpisodeSelect,
  compact = false,
  fillHeight = false,
  hideHeader = false,
  className,
}: PlayerEpisodePanelProps) {
  const sectionClassName = fillHeight
    ? 'h-full space-y-3 rounded-lg border border-border/60 bg-card/50 p-3 md:flex md:flex-col md:space-y-3 md:p-4'
    : 'space-y-3 rounded-lg border border-border/60 bg-card/50 p-3 md:p-4'

  const listClassName = compact
    ? 'grid grid-cols-2 gap-2'
    : 'grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8'

  return (
    <section className={cn(sectionClassName, className)}>
      {!hideHeader && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">选集</h2>
            <Badge variant="secondary" className="rounded-full text-xs">
              第 {selectedEpisode + 1} 集 / 共 {totalEpisodes} 集
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" className="rounded-full" onClick={onToggleOrder}>
              {isReversed ? <ArrowUpDown className="size-4" /> : <ArrowDownUp className="size-4" />}
              {isReversed ? '正序' : '倒序'}
            </Button>

            {pageRanges.length > 1 && (
              <Select value={currentPageRange} onValueChange={onPageRangeChange}>
                <SelectTrigger className="h-8 w-28 rounded-full bg-background/70">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageRanges.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      )}

      {hideHeader && (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" className="rounded-full" onClick={onToggleOrder}>
            {isReversed ? <ArrowUpDown className="size-4" /> : <ArrowDownUp className="size-4" />}
            {isReversed ? '正序' : '倒序'}
          </Button>

          {pageRanges.length > 1 && (
            <Select value={currentPageRange} onValueChange={onPageRangeChange}>
              <SelectTrigger className="h-8 w-28 rounded-full bg-background/70">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageRanges.map(range => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      <div className={`${listClassName} ${fillHeight ? 'md:flex-1 md:content-start' : ''}`}>
        {episodes.map(episode => {
          const active = selectedEpisode === episode.actualIndex
          return (
            <Button
              key={`${episode.actualIndex}-${episode.name}`}
              variant={active ? 'default' : 'secondary'}
              className="justify-start rounded-md"
              onClick={() => onEpisodeSelect(episode.displayIndex)}
            >
              <span className="line-clamp-1 text-left text-xs sm:text-sm">
                {episode.name || `第 ${episode.actualIndex + 1} 集`}
              </span>
            </Button>
          )
        })}
      </div>
    </section>
  )
}
