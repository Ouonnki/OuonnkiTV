/** 收藏项数据来源类型 */
export type FavoriteSourceType = 'tmdb' | 'cms'

/**
 * 收藏项观看状态
 */
export enum FavoriteWatchStatus {
  /** 未观看 */
  NOT_WATCHED = 'not_watched',
  /** 正在看 */
  WATCHING = 'watching',
  /** 已看完 */
  COMPLETED = 'completed',
}

/**
 * TMDB 收藏项
 */
export interface TmdbFavoriteItem {
  /** 唯一标识符，格式: tmdb_{mediaType}_{id} */
  id: string
  /** 添加时间戳 */
  addedAt: number
  /** 更新时间戳 */
  updatedAt: number
  /** 数据来源类型 */
  sourceType: 'tmdb'
  /** 观看状态 */
  watchStatus: FavoriteWatchStatus
  /** 用户备注 */
  notes?: string
  /** 用户评分 (1-5) */
  rating?: number
  /** 标签列表 */
  tags: string[]
  /** TMDB 媒体数据快照 */
  media: {
    id: number
    mediaType: 'movie' | 'tv'
    title: string
    originalTitle: string
    posterPath: string | null
    backdropPath: string | null
    releaseDate: string
    voteAverage: number
  }
}

/**
 * CMS 收藏项
 */
export interface CmsFavoriteItem {
  /** 唯一标识符，格式: cms_{base64(sourceCode::vodId)} */
  id: string
  /** 添加时间戳 */
  addedAt: number
  /** 更新时间戳 */
  updatedAt: number
  /** 数据来源类型 */
  sourceType: 'cms'
  /** 观看状态 */
  watchStatus: FavoriteWatchStatus
  /** 用户备注 */
  notes?: string
  /** 用户评分 (1-5) */
  rating?: number
  /** 标签列表 */
  tags: string[]
  /** CMS 视频数据快照 */
  media: {
    vodId: string
    vodName: string
    vodPic?: string
    typeName?: string
    vodYear?: string
    vodArea?: string
    sourceCode: string
    sourceName: string
  }
}

/**
 * 收藏项联合类型
 */
export type FavoriteItem = TmdbFavoriteItem | CmsFavoriteItem

/**
 * 收藏项列表
 */
export type FavoriteList = FavoriteItem[]

/**
 * 筛选器选项
 */
export interface FavoriteFilterOptions {
  /** 按数据来源筛选 */
  sourceType?: FavoriteSourceType | 'all'
  /** 按观看状态筛选 */
  watchStatus?: FavoriteWatchStatus | 'all'
  /** 按标签筛选 (OR 逻辑) */
  tags?: string[]
  /** 按评分筛选 (>=) */
  minRating?: number
  /** 排序方式 */
  sortBy?: 'addedAt' | 'updatedAt' | 'title' | 'rating' | 'releaseDate'
  /** 排序顺序 */
  sortOrder?: 'asc' | 'desc'
}

/**
 * 统计信息
 */
export interface FavoriteStats {
  total: number
  tmdbCount: number
  cmsCount: number
  notWatchedCount: number
  watchingCount: number
  completedCount: number
}
