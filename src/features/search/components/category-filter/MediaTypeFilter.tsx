import { cn } from '@/shared/lib/utils'
import type { TmdbFilterOptions } from '@/shared/types/tmdb'
import { MEDIA_TYPE_LABELS, MEDIA_TYPE_OPTIONS } from '../../constants'

interface MediaTypeFilterProps {
  /** 当前筛选条件 */
  filterOptions: TmdbFilterOptions
  /** 筛选条件变更回调 */
  onFilterChange: (options: Partial<TmdbFilterOptions>) => void
  className?: string
}

/**
 * 媒体类型筛选组件（全部/电影/剧集）
 */
export function MediaTypeFilter({
  filterOptions,
  onFilterChange,
  className,
}: MediaTypeFilterProps) {
  return (
    <div className={cn('flex gap-3', className)}>
      <span className="text-muted-foreground w-12 shrink-0 pt-1.5 text-sm font-medium">
        类型
      </span>
      <div className="flex flex-1 flex-wrap gap-2">
        {MEDIA_TYPE_OPTIONS.map(type => (
          <FilterChip
            key={type}
            label={MEDIA_TYPE_LABELS[type]}
            isSelected={
              filterOptions.mediaType === type || (!filterOptions.mediaType && type === 'all')
            }
            onClick={() =>
              onFilterChange({ mediaType: type === 'all' ? undefined : type })
            }
          />
        ))}
      </div>
    </div>
  )
}

interface FilterChipProps {
  label: string
  isSelected: boolean
  onClick: () => void
}

/**
 * FilterChip - 筛选标签组件
 */
export function FilterChip({ label, isSelected, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
        isSelected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-primary',
      )}
    >
      {label}
    </button>
  )
}
