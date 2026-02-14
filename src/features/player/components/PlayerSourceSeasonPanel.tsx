import { RadioTower, Layers3 } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import type { PlayerSeasonOption, PlayerSourceOption } from '@/features/player/hooks'

interface PlayerSourceSeasonPanelProps {
  isTmdbRoute: boolean
  sourceOptions: PlayerSourceOption[]
  selectedSourceCode: string
  onSourceChange: (sourceCode: string) => void
  seasonOptions: PlayerSeasonOption[]
  selectedSeasonNumber: number | null
  onSeasonChange: (seasonNumber: number) => void
  loadingSources: boolean
  showSourceSection?: boolean
  showSeasonSection?: boolean
  className?: string
}

export function PlayerSourceSeasonPanel({
  isTmdbRoute,
  sourceOptions,
  selectedSourceCode,
  onSourceChange,
  seasonOptions,
  selectedSeasonNumber,
  onSeasonChange,
  loadingSources,
  showSourceSection = true,
  showSeasonSection = true,
  className,
}: PlayerSourceSeasonPanelProps) {
  return (
    <section className={cn('space-y-3 rounded-lg border border-border/60 bg-card/55 p-3 md:p-4', className)}>
      {showSourceSection && (
        <article className="space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <RadioTower className="size-4" />
              换源
            </h2>
            {isTmdbRoute && (
              <Badge variant="outline" className="text-xs">
                {loadingSources ? '匹配中' : `${sourceOptions.length} 源`}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {sourceOptions.map(option => {
              const active = option.sourceCode === selectedSourceCode
              return (
                <Button
                  key={option.sourceCode}
                  size="sm"
                  variant={active ? 'default' : 'secondary'}
                  className="rounded-full"
                  onClick={() => onSourceChange(option.sourceCode)}
                >
                  {option.sourceName}
                  {isTmdbRoute && <span className="text-[11px] opacity-70">{option.bestScore}</span>}
                </Button>
              )
            })}
          </div>
        </article>
      )}

      {showSeasonSection && seasonOptions.length > 0 && (
        <article className="space-y-2.5 border-t border-border/45 pt-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Layers3 className="size-4" />
              选季
            </h2>
            <Badge variant="outline" className="text-xs">
              {seasonOptions.length} 季
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            {seasonOptions.map(option => {
              const active = option.seasonNumber === selectedSeasonNumber
              return (
                <Button
                  key={option.seasonNumber}
                  size="sm"
                  variant={active ? 'default' : 'secondary'}
                  className="rounded-full"
                  onClick={() => onSeasonChange(option.seasonNumber)}
                >
                  S{option.seasonNumber}
                  <span className="text-[11px] opacity-70">{option.matchedSourceCount}</span>
                </Button>
              )
            })}
          </div>
        </article>
      )}
    </section>
  )
}
