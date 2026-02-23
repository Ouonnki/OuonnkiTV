import type {
  VideoItem,
  VideoSource,
  SearchResult,
  DetailResult,
  CmsClientConfig,
  CmsEventType,
  EventHandler,
  EventByType,
  ApiPathConfig,
} from '../types'
import { DEFAULT_API_CONFIG, DEFAULT_CLIENT_CONFIG, DEFAULT_M3U8_PATTERN } from '../types'
import { createEventEmitter } from '../events'
import { createFetchAdapter } from '../adapters/fetch.adapter'
import { createDirectStrategy } from '../adapters/proxy.adapter'
import { searchVideos, type SearchConfig } from './search'
import { getVideoDetail, type DetailConfig } from './detail'
import { listVideos, type ListConfig } from './list'
import { createAggregatedSearch } from './aggregator'
import { parsePlayUrl as parsePlayUrlFn, type ParsedEpisodes } from './parser'

/**
 * CMS客户端接口
 */
export interface CmsClient {
  // 事件订阅
  on<T extends CmsEventType>(type: T, handler: EventHandler<EventByType<T>>): () => void
  off<T extends CmsEventType>(type: T, handler: EventHandler<EventByType<T>>): void
  once<T extends CmsEventType>(type: T, handler: EventHandler<EventByType<T>>): () => void

  // 搜索
  search(query: string, source: VideoSource): Promise<SearchResult>
  aggregatedSearch(
    query: string,
    sources: VideoSource[],
    page: number,
    signal?: AbortSignal,
  ): Promise<VideoItem[]>

  // 列表（不带搜索关键词，获取推荐/最新内容）
  listVideos(source: VideoSource, page?: number): Promise<SearchResult>

  // 详情
  getDetail(id: string, source: VideoSource): Promise<DetailResult>

  // 工具方法
  parsePlayUrl(playUrl: string, playFrom?: string): ParsedEpisodes

  // 销毁
  destroy(): void
}

/**
 * 创建CMS客户端
 * @param config 客户端配置
 */
export function createCmsClient(config?: CmsClientConfig): CmsClient {
  const {
    apiConfig = DEFAULT_API_CONFIG,
    requestAdapter = createFetchAdapter(),
    proxyStrategy = createDirectStrategy(),
    defaultTimeout = DEFAULT_CLIENT_CONFIG.defaultTimeout,
    defaultRetry = DEFAULT_CLIENT_CONFIG.defaultRetry,
    concurrencyLimit = DEFAULT_CLIENT_CONFIG.concurrencyLimit,
    m3u8Pattern = DEFAULT_M3U8_PATTERN,
  } = config || {}

  // 合并API配置
  const mergedApiConfig: ApiPathConfig = {
    search: { ...DEFAULT_API_CONFIG.search, ...apiConfig.search },
    detail: { ...DEFAULT_API_CONFIG.detail, ...apiConfig.detail },
  }

  // 创建事件发射器
  const emitter = createEventEmitter()

  // 搜索配置
  const searchConfig: SearchConfig = {
    requestAdapter,
    proxyStrategy,
    apiConfig: mergedApiConfig,
  }

  // 详情配置
  const detailConfig: DetailConfig = {
    requestAdapter,
    proxyStrategy,
    apiConfig: mergedApiConfig,
    m3u8Pattern,
  }

  // 列表配置
  const listConfig: ListConfig = {
    requestAdapter,
    proxyStrategy,
  }

  // 单源搜索（带事件）
  const searchWithEvents = async (query: string, source: VideoSource, page: number = 1): Promise<SearchResult> => {
    const sourceWithDefaults: VideoSource = {
      ...source,
      timeout: source.timeout ?? defaultTimeout,
      retry: source.retry ?? defaultRetry,
    }

    return searchVideos(query, sourceWithDefaults, searchConfig, page)
  }

  // 创建聚合搜索
  const aggregatedSearchFn = createAggregatedSearch(searchWithEvents, {
    concurrencyLimit,
    onProgress: (completed, total, source) => {
      emitter.emit({
        type: 'search:progress',
        source,
        completed,
        total,
      })
    },
    onResult: (items, source, pagination) => {
      emitter.emit({
        type: 'search:result',
        source,
        items,
        isIncremental: true,
        pagination,
      })
    },
  })

  return {
    // 事件方法
    on: emitter.on.bind(emitter),
    off: emitter.off.bind(emitter),
    once: emitter.once.bind(emitter),

    // 单源搜索
    async search(query: string, source: VideoSource): Promise<SearchResult> {
      return searchWithEvents(query, source)
    },

    // 获取视频列表（推荐/最新）
    async listVideos(source: VideoSource, page: number = 1): Promise<SearchResult> {
      const sourceWithDefaults: VideoSource = {
        ...source,
        timeout: source.timeout ?? defaultTimeout,
        retry: source.retry ?? defaultRetry,
      }
      return listVideos(sourceWithDefaults, listConfig, page)
    },

    // 聚合搜索
    async aggregatedSearch(
      query: string,
      sources: VideoSource[],
      page: number = 1,
      signal?: AbortSignal,
    ): Promise<VideoItem[]> {
      const startTime = Date.now()

      emitter.emit({
        type: 'search:start',
        query,
        sources,
        timestamp: startTime,
      })

      try {
        const results = await aggregatedSearchFn(query, sources, page, signal)

        emitter.emit({
          type: 'search:complete',
          query,
          totalItems: results.length,
          duration: Date.now() - startTime,
        })

        return results
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          emitter.emit({
            type: 'search:abort',
            query,
          })
        } else {
          emitter.emit({
            type: 'search:error',
            error: error as Error,
          })
        }
        throw error
      }
    },

    // 获取详情
    async getDetail(id: string, source: VideoSource): Promise<DetailResult> {
      const sourceWithDefaults: VideoSource = {
        ...source,
        timeout: source.timeout ?? defaultTimeout,
        retry: source.retry ?? defaultRetry,
      }

      emitter.emit({
        type: 'detail:start',
        id,
        source: sourceWithDefaults,
        timestamp: Date.now(),
      })

      try {
        const result = await getVideoDetail(id, sourceWithDefaults, detailConfig)

        if (result.success) {
          emitter.emit({
            type: 'detail:complete',
            id,
            source: sourceWithDefaults,
            videoInfo: result.videoInfo,
            episodes: result.episodes,
          })
        } else {
          emitter.emit({
            type: 'detail:error',
            id,
            source: sourceWithDefaults,
            error: new Error(result.error || '获取详情失败'),
          })
        }

        return result
      } catch (error) {
        emitter.emit({
          type: 'detail:error',
          id,
          source: sourceWithDefaults,
          error: error as Error,
        })
        throw error
      }
    },

    // 解析播放URL
    parsePlayUrl(playUrl: string, playFrom?: string): ParsedEpisodes {
      return parsePlayUrlFn(playUrl, playFrom)
    },

    // 销毁
    destroy(): void {
      emitter.removeAllListeners()
    },
  }
}
