import type { VideoItem, VideoDetail, Pagination } from './video'
import type { VideoSource } from './source'

/**
 * CMS事件类型
 */
export type CmsEventType =
  | 'search:start'
  | 'search:progress'
  | 'search:result'
  | 'search:complete'
  | 'search:error'
  | 'search:abort'
  | 'detail:start'
  | 'detail:complete'
  | 'detail:error'

/**
 * 搜索开始事件
 */
export interface SearchStartEvent {
  type: 'search:start'
  query: string
  sources: VideoSource[]
  timestamp: number
}

/**
 * 搜索进度事件
 */
export interface SearchProgressEvent {
  type: 'search:progress'
  source: VideoSource
  completed: number
  total: number
}

/**
 * 搜索结果事件（增量）
 */
export interface SearchResultEvent {
  type: 'search:result'
  source: VideoSource
  items: VideoItem[]
  isIncremental: boolean
  /** 分页信息 */
  pagination?: Pagination
}

/**
 * 搜索完成事件
 */
export interface SearchCompleteEvent {
  type: 'search:complete'
  query: string
  totalItems: number
  duration: number
}

/**
 * 搜索错误事件
 */
export interface SearchErrorEvent {
  type: 'search:error'
  source?: VideoSource
  error: Error
}

/**
 * 搜索中止事件
 */
export interface SearchAbortEvent {
  type: 'search:abort'
  query: string
}

/**
 * 详情开始事件
 */
export interface DetailStartEvent {
  type: 'detail:start'
  id: string
  source: VideoSource
  timestamp: number
}

/**
 * 详情完成事件
 */
export interface DetailCompleteEvent {
  type: 'detail:complete'
  id: string
  source: VideoSource
  videoInfo?: VideoDetail
  episodes: string[]
}

/**
 * 详情错误事件
 */
export interface DetailErrorEvent {
  type: 'detail:error'
  id: string
  source: VideoSource
  error: Error
}

/**
 * 所有CMS事件的联合类型
 */
export type CmsEvent =
  | SearchStartEvent
  | SearchProgressEvent
  | SearchResultEvent
  | SearchCompleteEvent
  | SearchErrorEvent
  | SearchAbortEvent
  | DetailStartEvent
  | DetailCompleteEvent
  | DetailErrorEvent

/**
 * 事件处理器类型
 */
export type EventHandler<T extends CmsEvent = CmsEvent> = (event: T) => void

/**
 * 根据事件类型获取事件数据类型
 */
export type EventByType<T extends CmsEventType> = Extract<CmsEvent, { type: T }>
