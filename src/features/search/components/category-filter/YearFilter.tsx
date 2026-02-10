import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import type { TmdbFilterOptions } from '@/shared/types/tmdb'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/components/ui/drawer'
import { FilterChip } from './MediaTypeFilter'
import { WrapFilterRow } from './CountryFilter'

interface YearFilterProps {
  /** 可用年份列表 */
  years: number[]
  /** 当前筛选条件 */
  filterOptions: TmdbFilterOptions
  /** 筛选条件变更回调 */
  onFilterChange: (options: Partial<TmdbFilterOptions>) => void
}

/**
 * 年份筛选组件
 * 移动端显示前5个年份 + 更多按钮，桌面端显示10个年份
 */
export function YearFilter({ years, filterOptions, onFilterChange }: YearFilterProps) {
  const [isYearDrawerOpen, setIsYearDrawerOpen] = useState(false)

  // 移动端显示的年份（前5个）
  const mobileYears = years.length > 0 ? years.slice(0, 5) : Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  // 桌面端显示的年份（前10个或全部）
  const desktopYears = years.length > 0 ? years : Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)

  // 抽屉中显示的所有年份
  const drawerYears = years.length > 0 ? years : Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i)

  // 计算更多按钮是否应显示选中状态
  const isMoreSelected =
    filterOptions.releaseYear !== undefined && !mobileYears.includes(filterOptions.releaseYear)

  return (
    <>
      {/* 移动端：前5个年份 + 更多按钮 */}
      <div className="md:hidden">
        <div className="flex gap-3">
          <span className="text-muted-foreground w-12 shrink-0 pt-1.5 text-sm font-medium">
            年份
          </span>
          <div className="flex flex-1 flex-wrap gap-2">
            <FilterChip
              label="全部"
              isSelected={!filterOptions.releaseYear}
              onClick={() => onFilterChange({ releaseYear: undefined })}
            />
            {mobileYears.map(year => (
              <FilterChip
                key={year}
                label={String(year)}
                isSelected={filterOptions.releaseYear === year}
                onClick={() => onFilterChange({ releaseYear: year })}
              />
            ))}
            <Drawer open={isYearDrawerOpen} onOpenChange={setIsYearDrawerOpen}>
              <DrawerTrigger asChild>
                <div>
                  <MoreButton
                    count={Math.max(0, (years.length > 5 ? years.length - 5 : 0) || 15)}
                    isSelected={isMoreSelected}
                  />
                </div>
              </DrawerTrigger>
              <DrawerContent className="max-h-[70vh]">
                <DrawerHeader>
                  <DrawerTitle>选择年份</DrawerTitle>
                </DrawerHeader>
                <div className="overflow-y-auto p-4">
                  <div className="flex flex-wrap gap-2">
                    <FilterChip
                      label="全部年份"
                      isSelected={!filterOptions.releaseYear}
                      onClick={() => {
                        onFilterChange({ releaseYear: undefined })
                        setIsYearDrawerOpen(false)
                      }}
                    />
                    {drawerYears.map(year => (
                      <FilterChip
                        key={year}
                        label={String(year)}
                        isSelected={filterOptions.releaseYear === year}
                        onClick={() => {
                          onFilterChange({ releaseYear: year })
                          setIsYearDrawerOpen(false)
                        }}
                      />
                    ))}
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>

      {/* 桌面端：前10个年份 */}
      <div className="hidden md:block">
        <WrapFilterRow label="年份">
          <FilterChip
            label="全部"
            isSelected={!filterOptions.releaseYear}
            onClick={() => onFilterChange({ releaseYear: undefined })}
          />
          {desktopYears.map(year => (
            <FilterChip
              key={year}
              label={String(year)}
              isSelected={filterOptions.releaseYear === year}
              onClick={() => onFilterChange({ releaseYear: year })}
            />
          ))}
        </WrapFilterRow>
      </div>
    </>
  )
}

interface MoreButtonProps {
  count: number
  isSelected?: boolean
}

/**
 * MoreButton - 更多按钮组件
 */
function MoreButton({ count, isSelected }: MoreButtonProps) {
  return (
    <button
      type="button"
      className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
        isSelected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-primary'
      }`}
    >
      <span>更多</span>
      <span className="text-xs opacity-70">({count})</span>
      <ChevronRight className="size-3" />
    </button>
  )
}
