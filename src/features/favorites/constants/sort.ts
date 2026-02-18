import type { FavoriteFilterOptions } from '../types/favorites'

type FavoriteSortBy = NonNullable<FavoriteFilterOptions['sortBy']>
type FavoriteSortOrder = NonNullable<FavoriteFilterOptions['sortOrder']>

export interface FavoriteSortOption {
  value: string
  label: string
  sortBy: FavoriteSortBy
  sortOrder: FavoriteSortOrder
}

export const FAVORITE_SORT_OPTIONS = [
  { value: 'added_desc', label: '最近收藏', sortBy: 'addedAt', sortOrder: 'desc' },
  { value: 'added_asc', label: '最早收藏', sortBy: 'addedAt', sortOrder: 'asc' },
  { value: 'updated_desc', label: '最近更新', sortBy: 'updatedAt', sortOrder: 'desc' },
  { value: 'title_asc', label: '名称 A-Z', sortBy: 'title', sortOrder: 'asc' },
  { value: 'title_desc', label: '名称 Z-A', sortBy: 'title', sortOrder: 'desc' },
  { value: 'rating_desc', label: '评分从高到低', sortBy: 'rating', sortOrder: 'desc' },
  { value: 'rating_asc', label: '评分从低到高', sortBy: 'rating', sortOrder: 'asc' },
] as const satisfies readonly FavoriteSortOption[]

export type FavoriteSortValue = (typeof FAVORITE_SORT_OPTIONS)[number]['value']

export const DEFAULT_FAVORITE_SORT_VALUE: FavoriteSortValue = 'added_desc'
