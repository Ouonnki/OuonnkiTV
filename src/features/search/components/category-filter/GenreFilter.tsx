import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import type { TmdbGenre, TmdbFilterOptions } from '@/shared/types/tmdb'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/components/ui/drawer'
import { FilterChip } from './MediaTypeFilter'
import { WrapFilterRow } from './CountryFilter'

interface GenreFilterProps {
  /** 电影分类列表 */
  movieGenres: TmdbGenre[]
  /** 剧集分类列表 */
  tvGenres: TmdbGenre[]
  /** 当前筛选条件 */
  filterOptions: TmdbFilterOptions
  /** 筛选条件变更回调 */
  onFilterChange: (options: Partial<TmdbFilterOptions>) => void
}

/**
 * 分类筛选组件（多选）
 * 移动端显示前8个分类 + 更多按钮，桌面端显示所有分类
 */
export function GenreFilter({
  movieGenres,
  tvGenres,
  filterOptions,
  onFilterChange,
}: GenreFilterProps) {
  const [isGenreDrawerOpen, setIsGenreDrawerOpen] = useState(false)

  // 合并并去重分类
  const allGenres = [...movieGenres, ...tvGenres].filter(
    (genre, index, self) => self.findIndex(g => g.id === genre.id) === index,
  )

  // 处理分类选择（多选）
  const handleGenreToggle = (genreId: number) => {
    const currentIds = filterOptions.genreIds || []
    const newIds = currentIds.includes(genreId)
      ? currentIds.filter(id => id !== genreId)
      : [...currentIds, genreId]
    onFilterChange({ genreIds: newIds.length > 0 ? newIds : undefined })
  }

  // 清除所有分类选择
  const handleClearGenres = () => {
    onFilterChange({ genreIds: undefined })
  }

  // 判断是否没有选择任何分类
  const noGenreSelected = !filterOptions.genreIds || filterOptions.genreIds.length === 0

  // 计算当前选中的其他分类数量
  const selectedOtherGenresCount = (filterOptions.genreIds || []).filter(
    id =>
      !movieGenres.slice(0, 6).some(g => g.id === id) &&
      !tvGenres.slice(0, 6).some(g => g.id === id),
  ).length

  return (
    <>
      {/* 移动端：前8个分类 + 更多按钮 */}
      <div className="md:hidden">
        <WrapFilterRow label="分类">
          <FilterChip label="全部" isSelected={noGenreSelected} onClick={handleClearGenres} />
          {allGenres.slice(0, 8).map(genre => (
            <FilterChip
              key={genre.id}
              label={genre.name}
              isSelected={filterOptions.genreIds?.includes(genre.id) || false}
              onClick={() => handleGenreToggle(genre.id)}
            />
          ))}
          {allGenres.length > 8 && (
            <Drawer open={isGenreDrawerOpen} onOpenChange={setIsGenreDrawerOpen}>
              <DrawerTrigger asChild>
                <div>
                  <MoreButton
                    count={allGenres.length - 8}
                    isSelected={selectedOtherGenresCount > 0}
                  />
                </div>
              </DrawerTrigger>
              <DrawerContent className="max-h-[70vh]">
                <DrawerHeader>
                  <DrawerTitle>选择分类</DrawerTitle>
                </DrawerHeader>
                <div className="overflow-y-auto p-4">
                  <div className="flex flex-wrap gap-2">
                    <FilterChip
                      label="全部分类"
                      isSelected={noGenreSelected}
                      onClick={() => {
                        handleClearGenres()
                        setIsGenreDrawerOpen(false)
                      }}
                    />
                    {allGenres.map(genre => (
                      <FilterChip
                        key={genre.id}
                        label={genre.name}
                        isSelected={filterOptions.genreIds?.includes(genre.id) || false}
                        onClick={() => handleGenreToggle(genre.id)}
                      />
                    ))}
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          )}
        </WrapFilterRow>
      </div>

      {/* 桌面端：所有分类 */}
      <div className="hidden md:block">
        <WrapFilterRow label="分类">
          <FilterChip label="全部" isSelected={noGenreSelected} onClick={handleClearGenres} />
          {allGenres.map(genre => (
            <FilterChip
              key={genre.id}
              label={genre.name}
              isSelected={filterOptions.genreIds?.includes(genre.id) || false}
              onClick={() => handleGenreToggle(genre.id)}
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
