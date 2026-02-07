// 视频相关类型
export type { VideoItem, VideoDetail, SearchResult, DetailResult, Pagination } from './video'

// 视频源相关类型
export type { VideoSource, SourceStore } from './source'
export { createEmptySourceStore } from './source'

// 事件相关类型
export type {
  CmsEventType,
  CmsEvent,
  EventHandler,
  EventByType,
  SearchStartEvent,
  SearchProgressEvent,
  SearchResultEvent,
  SearchCompleteEvent,
  SearchErrorEvent,
  SearchAbortEvent,
  DetailStartEvent,
  DetailCompleteEvent,
  DetailErrorEvent,
} from './events'

// 适配器相关类型
export type { RequestConfig, RequestAdapter, ProxyStrategy } from './adapter'
export { createDefaultProxyStrategy, createNoProxyStrategy } from './adapter'

// 配置相关类型
export type { ApiPathConfig, CmsClientConfig } from './config'
export { DEFAULT_API_CONFIG, DEFAULT_M3U8_PATTERN, DEFAULT_CLIENT_CONFIG } from './config'
