import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ArrowUpDown } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import type { TmdbFilterOptions, TmdbGenre, TmdbCountry } from '@/shared/types/tmdb'

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
  className?: string
}

// 常用国家列表（优先展示）
const POPULAR_COUNTRIES = ['CN', 'US', 'JP', 'KR', 'GB', 'TW', 'HK', 'FR', 'DE', 'IN']

// 国家中文名称映射
const COUNTRY_CHINESE_NAMES: Record<string, string> = {
  CN: '中国大陆',
  US: '美国',
  JP: '日本',
  KR: '韩国',
  GB: '英国',
  TW: '台湾',
  HK: '香港',
  FR: '法国',
  DE: '德国',
  IN: '印度',
  CA: '加拿大',
  AU: '澳大利亚',
  IT: '意大利',
  ES: '西班牙',
  RU: '俄罗斯',
  BR: '巴西',
  MX: '墨西哥',
  TH: '泰国',
  PH: '菲律宾',
  SG: '新加坡',
  MY: '马来西亚',
  NZ: '新西兰',
  SE: '瑞典',
  NO: '挪威',
  DK: '丹麦',
  NL: '荷兰',
  BE: '比利时',
  PL: '波兰',
  AT: '奥地利',
  CH: '瑞士',
}

// 评分选项
const RATING_OPTIONS = [
  { value: 0, label: '全部' },
  { value: 6, label: '6分以上' },
  { value: 7, label: '7分以上' },
  { value: 8, label: '8分以上' },
  { value: 9, label: '9分以上' },
]

// 排序选项
const SORT_OPTIONS = [
  { value: 'default', label: '默认' },
  { value: 'popularity', label: '热度' },
  { value: 'vote_average', label: '评分' },
  { value: 'release_date', label: '上映日期' },
]

/**
 * FilterChip - 筛选标签组件
 */
function FilterChip({
  label,
  isSelected,
  onClick,
}: {
  label: string
  isSelected: boolean
  onClick: () => void
}) {
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

/**
 * WrapFilterRow - 换行显示筛选行
 */
function WrapFilterRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-3">
      <span className="text-muted-foreground w-12 shrink-0 pt-1.5 text-sm font-medium">{label}</span>
      <div className="flex flex-1 flex-wrap gap-2">
        {children}
      </div>
    </div>
  )
}

/**
 * 获取国家的中文名称
 */
function getCountryChineseName(country: TmdbCountry): string {
  return COUNTRY_CHINESE_NAMES[country.iso_3166_1] || country.native_name || country.english_name
}

/**
 * CategoryFilterSection - 分类筛选区域组件
 */
export function CategoryFilterSection({
  movieGenres,
  tvGenres,
  countries,
  years,
  filterOptions,
  onFilterChange,
  className,
}: CategoryFilterSectionProps) {
  // 默认折叠
  const [isExpanded, setIsExpanded] = useState(false)

  // 合并并去重分类
  const allGenres = [...movieGenres, ...tvGenres].filter(
    (genre, index, self) => self.findIndex(g => g.id === genre.id) === index,
  )

  // 排序国家列表，常用国家优先
  const sortedCountries = [...countries].sort((a, b) => {
    const aIndex = POPULAR_COUNTRIES.indexOf(a.iso_3166_1)
    const bIndex = POPULAR_COUNTRIES.indexOf(b.iso_3166_1)
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    return getCountryChineseName(a).localeCompare(getCountryChineseName(b))
  })

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

  return (
    <div className={cn('space-y-3', className)}>
      {/* 基础筛选：类型和地区（始终显示） */}
      <WrapFilterRow label="类型">
        {(['all', 'movie', 'tv'] as const).map(type => (
          <FilterChip
            key={type}
            label={type === 'all' ? '全部' : type === 'movie' ? '电影' : '剧集'}
            isSelected={filterOptions.mediaType === type || (!filterOptions.mediaType && type === 'all')}
            onClick={() => onFilterChange({ mediaType: type === 'all' ? undefined : type })}
          />
        ))}
      </WrapFilterRow>

      <WrapFilterRow label="地区">
        <FilterChip
          label="全部"
          isSelected={!filterOptions.originCountry}
          onClick={() => onFilterChange({ originCountry: undefined })}
        />
        {sortedCountries.slice(0, 20).map(country => (
          <FilterChip
            key={country.iso_3166_1}
            label={getCountryChineseName(country)}
            isSelected={filterOptions.originCountry === country.iso_3166_1}
            onClick={() => onFilterChange({ originCountry: country.iso_3166_1 })}
          />
        ))}
      </WrapFilterRow>

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
            {/* 分类标签 */}
            <WrapFilterRow label="分类">
              <FilterChip
                label="全部"
                isSelected={noGenreSelected}
                onClick={handleClearGenres}
              />
              {allGenres.map(genre => (
                <FilterChip
                  key={genre.id}
                  label={genre.name}
                  isSelected={filterOptions.genreIds?.includes(genre.id) || false}
                  onClick={() => handleGenreToggle(genre.id)}
                />
              ))}
            </WrapFilterRow>

            {/* 上映年份 */}
            <WrapFilterRow label="年份">
              <FilterChip
                label="全部"
                isSelected={!filterOptions.releaseYear}
                onClick={() => onFilterChange({ releaseYear: undefined })}
              />
              {(years.length > 0 ? years : Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)).map(year => (
                <FilterChip
                  key={year}
                  label={String(year)}
                  isSelected={filterOptions.releaseYear === year}
                  onClick={() => onFilterChange({ releaseYear: year })}
                />
              ))}
            </WrapFilterRow>

            {/* 评分和排序 */}
            <div className="flex gap-3">
              <span className="text-muted-foreground w-12 shrink-0 pt-1.5 text-sm font-medium">更多</span>
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">评分</span>
                  <Select
                    value={String(filterOptions.minVoteAverage || 0)}
                    onValueChange={value => onFilterChange({ minVoteAverage: Number(value) || undefined })}
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

                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">排序</span>
                  <Select
                    value={filterOptions.sortBy || 'default'}
                    onValueChange={value =>
                      onFilterChange({ sortBy: value === 'default' ? undefined : value as TmdbFilterOptions['sortBy'] })
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* 展开/收起按钮 - 放在下方中间 */}
      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm transition-colors"
        >
          <span>{isExpanded ? '收起' : '展开更多'}</span>
          <ChevronDown
            className={cn('size-4 transition-transform', isExpanded && 'rotate-180')}
          />
        </button>
      </div>
    </div>
  )
}
