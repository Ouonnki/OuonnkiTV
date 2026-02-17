import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/button'
import type { TmdbFilterOptions, TmdbGenre, TmdbCountry } from '@/shared/types/tmdb'
import {
  MediaTypeFilter,
  CountryFilter,
  GenreFilter,
  YearFilter,
  AdvancedFilter,
  FilterSkeleton,
  ExpandToggle,
} from './category-filter'

interface CategoryFilterSectionProps {
  /** 电影分类列表 */
  movieGenres: TmdbGenre[]
  /** 剧集分类列表 */
  tvGenres: TmdbGenre[]
  /** 国家列表 */
  countries: TmdbCountry[]
  /** 可用年份列表 */
  years: number[]
  /** 当前筛选条件 */
  filterOptions: TmdbFilterOptions
  /** 筛选条件变更回调 */
  onFilterChange: (options: Partial<TmdbFilterOptions>) => void
  /** 清除所有筛选条件 */
  onClear: () => void
  /** 是否加载中 */
  isLoading?: boolean
  className?: string
}

/**
 * CategoryFilterSection - 分类筛选区域组件
 *
 * 提供媒体类型、国家/地区、分类、年份、评分和排序等多维度筛选功能
 */
export function CategoryFilterSection({
  movieGenres,
  tvGenres,
  countries,
  years,
  filterOptions,
  onFilterChange,
  onClear,
  isLoading = false,
  className,
}: CategoryFilterSectionProps) {
  // 控制更多筛选的展开/收起状态
  const [isExpanded, setIsExpanded] = useState(false)

  // 如果正在加载，显示骨架屏
  if (isLoading) {
    return <FilterSkeleton />
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* 基础筛选：媒体类型（始终显示） */}
      <MediaTypeFilter
        filterOptions={filterOptions}
        onFilterChange={onFilterChange}
      />

      {/* 地区筛选 */}
      <CountryFilter
        countries={countries}
        filterOptions={filterOptions}
        onFilterChange={onFilterChange}
      />

      {/* 展开后显示的更多筛选 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 overflow-hidden"
          >
            {/* 分类筛选 */}
            <GenreFilter
              movieGenres={movieGenres}
              tvGenres={tvGenres}
              filterOptions={filterOptions}
              onFilterChange={onFilterChange}
            />

            {/* 年份筛选 */}
            <YearFilter
              years={years}
              filterOptions={filterOptions}
              onFilterChange={onFilterChange}
            />

            {/* 评分和排序 */}
            <AdvancedFilter
              filterOptions={filterOptions}
              onFilterChange={onFilterChange}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 展开/收起按钮 */}
      <div className="flex items-center justify-center gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-full px-4"
          onClick={onClear}
        >
          清空筛选
        </Button>
        <ExpandToggle isExpanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)} />
      </div>
    </div>
  )
}
