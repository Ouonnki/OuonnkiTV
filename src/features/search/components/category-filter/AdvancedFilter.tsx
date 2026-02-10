import { ArrowUpDown } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import type { TmdbFilterOptions } from '@/shared/types/tmdb'
import { RATING_OPTIONS, SORT_OPTIONS } from '../../constants'

interface AdvancedFilterProps {
  /** 当前筛选条件 */
  filterOptions: TmdbFilterOptions
  /** 筛选条件变更回调 */
  onFilterChange: (options: Partial<TmdbFilterOptions>) => void
}

/**
 * 高级筛选组件（评分和排序）
 */
export function AdvancedFilter({
  filterOptions,
  onFilterChange,
}: AdvancedFilterProps) {
  return (
    <div className="flex gap-3">
      <span className="text-muted-foreground w-12 shrink-0 pt-1.5 text-sm font-medium">
        更多
      </span>
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {/* 评分筛选 */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">评分</span>
          <Select
            value={String(filterOptions.minVoteAverage || 0)}
            onValueChange={value =>
              onFilterChange({ minVoteAverage: Number(value) || undefined })
            }
          >
            <SelectTrigger className="h-8 w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RATING_OPTIONS.map(option => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 排序筛选 */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">排序</span>
          <Select
            value={filterOptions.sortBy || 'default'}
            onValueChange={value =>
              onFilterChange({
                sortBy:
                  value === 'default' ? undefined : (value as TmdbFilterOptions['sortBy']),
              })
            }
          >
            <SelectTrigger className="h-8 w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() =>
              onFilterChange({
                sortOrder: filterOptions.sortOrder === 'asc' ? 'desc' : 'asc',
              })
            }
          >
            <ArrowUpDown
              className={cn(
                'size-4 transition-transform',
                filterOptions.sortOrder === 'asc' && 'rotate-180',
              )}
            />
          </Button>
        </div>
      </div>
    </div>
  )
}
