import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ArrowUpDown, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/components/ui/drawer'
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
  /** 是否加载中 */
  isLoading?: boolean
  className?: string
}

// 移动端优先展示的常用国家（6个）
const POPULAR_COUNTRIES_MOBILE = ['CN', 'US', 'JP', 'KR', 'HK', 'TW']

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
  // 扩展更多国家
  ID: '印度尼西亚',
  VN: '越南',
  UA: '乌克兰',
  TR: '土耳其',
  PT: '葡萄牙',
  IE: '爱尔兰',
  CZ: '捷克',
  HU: '匈牙利',
  RO: '罗马尼亚',
  BG: '保加利亚',
  FI: '芬兰',
  GR: '希腊',
  IL: '以色列',
  ZA: '南非',
  AE: '阿联酋',
  AR: '阿根廷',
  CL: '智利',
  CO: '哥伦比亚',
  PE: '秘鲁',
  VE: '委内瑞拉',
  EG: '埃及',
  NG: '尼日利亚',
  KE: '肯尼亚',
  MA: '摩洛哥',
  TZ: '坦桑尼亚',
  UG: '乌干达',
  ZW: '津巴布韦',
  GH: '加纳',
  ET: '埃塞俄比亚',
  LK: '斯里兰卡',
  BD: '孟加拉国',
  PK: '巴基斯坦',
  NP: '尼泊尔',
  MM: '缅甸',
  KH: '柬埔寨',
  LA: '老挝',
  MN: '蒙古',
  KP: '朝鲜',
  QA: '卡塔尔',
  BH: '巴林',
  OM: '阿曼',
  KW: '科威特',
  SA: '沙特阿拉伯',
  JO: '约旦',
  LB: '黎巴嫩',
  SY: '叙利亚',
  IQ: '伊拉克',
  IR: '伊朗',
  AF: '阿富汗',
  UZ: '乌兹别克斯坦',
  KZ: '哈萨克斯坦',
  KG: '吉尔吉斯斯坦',
  TJ: '塔吉克斯坦',
  TM: '土库曼斯坦',
  GE: '格鲁吉亚',
  AZ: '阿塞拜疆',
  AM: '亚美尼亚',
  MD: '摩尔多瓦',
  BY: '白俄罗斯',
  LT: '立陶宛',
  LV: '拉脱维亚',
  EE: '爱沙尼亚',
  SK: '斯洛伐克',
  SI: '斯洛文尼亚',
  HR: '克罗地亚',
  BA: '波黑',
  ME: '黑山',
  MK: '北马其顿',
  AL: '阿尔巴尼亚',
  RS: '塞尔维亚',
  MT: '马耳他',
  CY: '塞浦路斯',
  LU: '卢森堡',
  IS: '冰岛',
  AD: '安道尔',
  MC: '摩纳哥',
  LI: '列支敦士登',
  SM: '圣马力诺',
  VA: '梵蒂冈',
  GI: '直布罗陀',
  FO: '法罗群岛',
  AX: '奥兰群岛',
  SJ: '斯瓦尔巴',
  PM: '圣皮埃尔和密克隆',
  GL: '格陵兰',
  BM: '百慕大',
  KY: '开曼群岛',
  TC: '特克斯和凯科斯群岛',
  VG: '英属维尔京群岛',
  AI: '安圭拉',
  MS: '蒙特塞拉特',
  KN: '圣基茨和尼维斯',
  AG: '安提瓜和巴布达',
  DM: '多米尼克',
  LC: '圣卢西亚',
  VC: '圣文森特和格林纳丁斯',
  BB: '巴巴多斯',
  GD: '格林纳达',
  TT: '特立尼达和多巴哥',
  BS: '巴哈马',
  CU: '古巴',
  JM: '牙买加',
  HT: '海地',
  DO: '多米尼加',
  GP: '瓜德罗普',
  MQ: '马提尼克',
  AW: '阿鲁巴',
  CW: '库拉索',
  SX: '圣马丁',
  MF: '法属圣马丁',
  BL: '圣巴泰勒米',
  BQ: '博奈尔',
  SR: '苏里南',
  GY: '圭亚那',
  FK: '福克兰群岛',
  GF: '法属圭亚那',
  PY: '巴拉圭',
  UY: '乌拉圭',
  BO: '玻利维亚',
  EC: '厄瓜多尔',
  CR: '哥斯达黎加',
  PA: '巴拿马',
  GT: '危地马拉',
  HN: '洪都拉斯',
  SV: '萨尔瓦多',
  NI: '尼加拉瓜',
  BZ: '伯利兹',
  PN: '皮特凯恩群岛',
  NR: '瑙鲁',
  KI: '基里巴斯',
  TV: '图瓦卢',
  TO: '汤加',
  WS: '萨摩亚',
  FJ: '斐济',
  VU: '瓦努阿图',
  SB: '所罗门群岛',
  PG: '巴布亚新几内亚',
  PW: '帕劳',
  FM: '密克罗尼西亚联邦',
  MH: '马绍尔群岛',
  CK: '库克群岛',
  NU: '纽埃',
  TK: '托克劳',
  WF: '瓦利斯和富图纳',
  AS: '美属萨摩亚',
  GU: '关岛',
  MP: '北马里亚纳群岛',
  VI: '美属维尔京群岛',
  RE: '留尼汪',
  YT: '马约特',
  SC: '塞舌尔',
  MU: '毛里求斯',
  KM: '科摩罗',
  MG: '马达加斯加',
  ZM: '赞比亚',
  MW: '马拉维',
  MZ: '莫桑比克',
  LS: '莱索托',
  SZ: '斯威士兰',
  BW: '博茨瓦纳',
  NA: '纳米比亚',
  AO: '安哥拉',
  CD: '刚果民主共和国',
  CG: '刚果共和国',
  GA: '加蓬',
  GQ: '赤道几内亚',
  ST: '圣多美和普林西比',
  CV: '佛得角',
  GW: '几内亚比绍',
  GN: '几内亚',
  SL: '塞拉利昂',
  LR: '利比里亚',
  CI: '科特迪瓦',
  BF: '布基纳法索',
  ML: '马里',
  NE: '尼日尔',
  TD: '乍得',
  SS: '南苏丹',
  SO: '索马里',
  DJ: '吉布提',
  ER: '厄立特里亚',
  CF: '中非共和国',
  PS: '巴勒斯坦',
  XK: '科索沃',
  MO: '澳门',
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
 * FilterSkeleton - 筛选骨架屏组件
 * 匹配实际筛选布局：类型3个、地区7个+更多按钮、展开按钮
 */
function FilterSkeleton() {
  return (
    <div className="space-y-3">
      {/* 类型行 - 3个标签（全部/电影/剧集） */}
      <div className="flex gap-3">
        <Skeleton className="h-6 w-12 shrink-0" />
        <div className="flex flex-1 flex-wrap gap-2">
          <Skeleton className="h-8 w-12 rounded-full" />
          <Skeleton className="h-8 w-12 rounded-full" />
          <Skeleton className="h-8 w-12 rounded-full" />
        </div>
      </div>
      {/* 地区行 - 1个全部 + 6个常用 + 更多按钮 */}
      <div className="flex gap-3">
        <Skeleton className="h-6 w-12 shrink-0" />
        <div className="flex flex-1 flex-wrap gap-2">
          <Skeleton className="h-8 w-12 rounded-full" />
          <Skeleton className="h-8 w-12 rounded-full" />
          <Skeleton className="h-8 w-12 rounded-full" />
          <Skeleton className="h-8 w-12 rounded-full" />
          <Skeleton className="h-8 w-12 rounded-full" />
          <Skeleton className="h-8 w-12 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      </div>
      {/* 展开/收起按钮骨架 */}
      <div className="flex justify-center pt-1">
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  )
}
function MoreButton({ count, isSelected }: { count: number; isSelected?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
        isSelected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-primary',
      )}
    >
      <span>更多</span>
      <span className="text-xs opacity-70">({count})</span>
      <ChevronRight className="size-3" />
    </button>
  )
}

/**
 * WrapFilterRow - 换行显示筛选行
 */
function WrapFilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="text-muted-foreground w-12 shrink-0 pt-1.5 text-sm font-medium">
        {label}
      </span>
      <div className="flex flex-1 flex-wrap gap-2">{children}</div>
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
  isLoading = false,
  className,
}: CategoryFilterSectionProps) {
  // 默认折叠
  const [isExpanded, setIsExpanded] = useState(false)
  // 移动端更多国家抽屉
  const [isCountryDrawerOpen, setIsCountryDrawerOpen] = useState(false)
  // 移动端更多分类抽屉
  const [isGenreDrawerOpen, setIsGenreDrawerOpen] = useState(false)
  // 移动端更多年份抽屉
  const [isYearDrawerOpen, setIsYearDrawerOpen] = useState(false)

  // 合并并去重分类
  const allGenres = [...movieGenres, ...tvGenres].filter(
    (genre, index, self) => self.findIndex(g => g.id === genre.id) === index,
  )

  // 排序国家列表，常用国家优先
  const sortedCountries = [...countries].sort((a, b) => {
    const aIndex = POPULAR_COUNTRIES_MOBILE.indexOf(a.iso_3166_1)
    const bIndex = POPULAR_COUNTRIES_MOBILE.indexOf(b.iso_3166_1)
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    return getCountryChineseName(a).localeCompare(getCountryChineseName(b))
  })

  // 常用国家（移动端只显示6个）
  const popularCountries = sortedCountries.filter(c =>
    POPULAR_COUNTRIES_MOBILE.includes(c.iso_3166_1),
  )
  const otherCountries = sortedCountries.filter(
    c => !POPULAR_COUNTRIES_MOBILE.includes(c.iso_3166_1),
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

  // 计算当前选中的其他国家数量（用于显示红点提示）
  const selectedOtherCountriesCount = filterOptions.originCountry
    ? otherCountries.filter(c => c.iso_3166_1 === filterOptions.originCountry).length
    : 0

  // 计算当前选中的其他分类数量
  const selectedOtherGenresCount = (filterOptions.genreIds || []).filter(
    id =>
      !movieGenres.slice(0, 6).some(g => g.id === id) &&
      !tvGenres.slice(0, 6).some(g => g.id === id),
  ).length

  // 如果正在加载，显示骨架屏
  if (isLoading) {
    return <FilterSkeleton />
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* 基础筛选：类型（始终显示，换行） */}
      <WrapFilterRow label="类型">
        {(['all', 'movie', 'tv'] as const).map(type => (
          <FilterChip
            key={type}
            label={type === 'all' ? '全部' : type === 'movie' ? '电影' : '剧集'}
            isSelected={
              filterOptions.mediaType === type || (!filterOptions.mediaType && type === 'all')
            }
            onClick={() => onFilterChange({ mediaType: type === 'all' ? undefined : type })}
          />
        ))}
      </WrapFilterRow>

      {/* 地区 - 移动端优先展示常用国家，其他放入抽屉 */}
      <div className="md:hidden">
        <WrapFilterRow label="地区">
          <FilterChip
            label="全部"
            isSelected={!filterOptions.originCountry}
            onClick={() => onFilterChange({ originCountry: undefined })}
          />
          {popularCountries.map(country => (
            <FilterChip
              key={country.iso_3166_1}
              label={getCountryChineseName(country)}
              isSelected={filterOptions.originCountry === country.iso_3166_1}
              onClick={() => onFilterChange({ originCountry: country.iso_3166_1 })}
            />
          ))}
          {/* 更多国家按钮 */}
          {otherCountries.length > 0 && (
            <Drawer open={isCountryDrawerOpen} onOpenChange={setIsCountryDrawerOpen}>
              <DrawerTrigger asChild>
                <div>
                  <MoreButton
                    count={otherCountries.length}
                    isSelected={selectedOtherCountriesCount > 0}
                  />
                </div>
              </DrawerTrigger>
              <DrawerContent className="max-h-[70vh]">
                <DrawerHeader>
                  <DrawerTitle>选择地区</DrawerTitle>
                </DrawerHeader>
                <div className="overflow-y-auto p-4">
                  <div className="flex flex-wrap gap-2">
                    <FilterChip
                      label="全部地区"
                      isSelected={!filterOptions.originCountry}
                      onClick={() => {
                        onFilterChange({ originCountry: undefined })
                        setIsCountryDrawerOpen(false)
                      }}
                    />
                    {sortedCountries.map(country => (
                      <FilterChip
                        key={country.iso_3166_1}
                        label={getCountryChineseName(country)}
                        isSelected={filterOptions.originCountry === country.iso_3166_1}
                        onClick={() => {
                          onFilterChange({ originCountry: country.iso_3166_1 })
                          setIsCountryDrawerOpen(false)
                        }}
                      />
                    ))}
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          )}
        </WrapFilterRow>
      </div>

      {/* 地区 - 桌面端保持原有布局 */}
      <div className="hidden md:block">
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
      </div>

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
            {/* 分类标签 - 移动端优先展示常用分类 */}
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

            {/* 分类标签 - 桌面端 */}
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

            {/* 上映年份 - 移动端使用下拉选择 */}
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
                  {(years.length > 0
                    ? years.slice(0, 5)
                    : Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
                  ).map(year => (
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
                          isSelected={
                            filterOptions.releaseYear !== undefined &&
                            !(
                              years.length > 0
                                ? years.slice(0, 5)
                                : Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
                            ).includes(filterOptions.releaseYear)
                          }
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
                          {(years.length > 0
                            ? years
                            : Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i)
                          ).map(year => (
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

            {/* 上映年份 - 桌面端 */}
            <div className="hidden md:block">
              <WrapFilterRow label="年份">
                <FilterChip
                  label="全部"
                  isSelected={!filterOptions.releaseYear}
                  onClick={() => onFilterChange({ releaseYear: undefined })}
                />
                {(years.length > 0
                  ? years
                  : Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)
                ).map(year => (
                  <FilterChip
                    key={year}
                    label={String(year)}
                    isSelected={filterOptions.releaseYear === year}
                    onClick={() => onFilterChange({ releaseYear: year })}
                  />
                ))}
              </WrapFilterRow>
            </div>

            {/* 评分和排序 */}
            <div className="flex gap-3">
              <span className="text-muted-foreground w-12 shrink-0 pt-1.5 text-sm font-medium">
                更多
              </span>
              <div className="flex flex-1 flex-wrap items-center gap-2">
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
          <ChevronDown className={cn('size-4 transition-transform', isExpanded && 'rotate-180')} />
        </button>
      </div>
    </div>
  )
}
