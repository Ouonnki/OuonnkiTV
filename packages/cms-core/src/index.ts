// 类型导出
export type {
  // 视频相关
  VideoItem,
  VideoDetail,
  SearchResult,
  DetailResult,
  Pagination,
  // 视频源相关
  VideoSource,
  SourceStore,
  // 事件相关
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
  // 适配器相关
  RequestConfig,
  RequestAdapter,
  ProxyStrategy,
  // 配置相关
  ApiPathConfig,
  CmsClientConfig,
} from './types'

// 类型工具函数
export {
  createEmptySourceStore,
  createDefaultProxyStrategy,
  createNoProxyStrategy,
  DEFAULT_API_CONFIG,
  DEFAULT_M3U8_PATTERN,
  DEFAULT_CLIENT_CONFIG,
} from './types'

// 核心功能
export { createCmsClient, type CmsClient } from './core/client'
export { searchVideos, type SearchConfig } from './core/search'
export { getVideoDetail, type DetailConfig } from './core/detail'
export { listVideos, type ListConfig } from './core/list'
export {
  createAggregatedSearch,
  type AggregatorOptions,
  type AggregatedSearchFn,
} from './core/aggregator'
export { createConcurrencyLimiter, type ConcurrencyLimiter } from './core/concurrency'
export { parsePlayUrl, extractM3u8FromContent, type ParsedEpisodes } from './core/parser'

// 事件系统
export { createEventEmitter, type CmsEventEmitter } from './events'

// 适配器
export { createFetchAdapter } from './adapters/fetch.adapter'
export {
  createUrlPrefixProxyStrategy,
  createWhitelistProxyStrategy,
  createDirectStrategy,
} from './adapters/proxy.adapter'

// 工具函数
export { buildApiUrl, buildSearchUrl, buildDetailUrl, buildListUrl } from './utils/url'
