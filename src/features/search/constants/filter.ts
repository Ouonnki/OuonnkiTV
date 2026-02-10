/**
 * 筛选相关常量
 */

/** 评分选项 */
export interface RatingOption {
  value: number
  label: string
}

/** 排序选项 */
export interface SortOption {
  value: string
  label: string
}

/** 评分选项配置 */
export const RATING_OPTIONS: Readonly<RatingOption[]> = [
  { value: 0, label: '全部' },
  { value: 6, label: '6分以上' },
  { value: 7, label: '7分以上' },
  { value: 8, label: '8分以上' },
  { value: 9, label: '9分以上' },
] as const

/** 排序选项配置 */
export const SORT_OPTIONS: Readonly<SortOption[]> = [
  { value: 'default', label: '默认' },
  { value: 'popularity', label: '热度' },
  { value: 'vote_average', label: '评分' },
  { value: 'release_date', label: '上映日期' },
] as const

/** 媒体类型选项 */
export const MEDIA_TYPE_OPTIONS = ['all', 'movie', 'tv'] as const

export type MediaTypeOption = (typeof MEDIA_TYPE_OPTIONS)[number]

/** 媒体类型标签映射 */
export const MEDIA_TYPE_LABELS: Readonly<Record<MediaTypeOption, string>> = {
  all: '全部',
  movie: '电影',
  tv: '剧集',
} as const
