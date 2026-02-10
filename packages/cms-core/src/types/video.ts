/**
 * 视频搜索结果项
 */
export interface VideoItem {
  vod_id: string
  vod_name: string
  vod_pic?: string
  vod_remarks?: string
  type_name?: string
  vod_year?: string
  vod_area?: string
  vod_director?: string
  vod_actor?: string
  vod_content?: string
  vod_play_url?: string
  /** 豆瓣评分 */
  vod_douban_score?: number | string
  /** 归属源名称 */
  source_name?: string
  /** 归属源ID */
  source_code?: string
  /** 归属源URL */
  api_url?: string
}

/**
 * 视频详情
 */
export interface VideoDetail {
  title: string
  cover?: string
  desc?: string
  type?: string
  year?: string
  area?: string
  director?: string
  actor?: string
  remarks?: string
  source_name?: string
  source_code?: string
  episodes_names?: string[]
}

/**
 * 分页信息
 */
export interface Pagination {
  /** 当前页码 */
  page: number
  /** 总页数 */
  totalPages: number
  /** 总结果数 */
  totalResults: number
}

/**
 * 搜索结果
 */
export interface SearchResult {
  success: boolean
  items: VideoItem[]
  error?: string
  /** 分页信息 */
  pagination?: Pagination
}

/**
 * 详情结果
 */
export interface DetailResult {
  success: boolean
  episodes: string[]
  videoInfo?: VideoDetail
  detailUrl?: string
  error?: string
}
