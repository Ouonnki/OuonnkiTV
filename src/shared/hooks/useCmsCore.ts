import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import {
  createCmsClient,
  createUrlPrefixProxyStrategy,
  type CmsClient,
  type VideoSource,
  type VideoItem,
  type DetailResult,
  type CmsClientConfig,
  type SearchResultEvent,
  type SearchProgressEvent,
  type SearchErrorEvent,
} from '@ouonnki/cms-core'
import { useSettingStore } from '@/shared/store/settingStore'

/**
 * 默认代理URL
 */
const DEFAULT_PROXY_URL = '/proxy?url='

/**
 * 获取或创建CmsClient单例
 */
let globalClient: CmsClient | null = null
let globalConcurrencyLimit: number | null = null

function getCmsClient(config?: CmsClientConfig): CmsClient {
  const settingLimit = useSettingStore.getState().network.concurrencyLimit
  // 当 concurrencyLimit 变化时重建单例
  if (globalClient && globalConcurrencyLimit !== settingLimit) {
    globalClient.destroy()
    globalClient = null
  }
  if (!globalClient) {
    globalConcurrencyLimit = settingLimit
    globalClient = createCmsClient({
      proxyStrategy: createUrlPrefixProxyStrategy(DEFAULT_PROXY_URL),
      concurrencyLimit: settingLimit,
      ...config,
    })
  }
  return globalClient
}

/**
 * 销毁全局CmsClient
 */
export function destroyCmsClient(): void {
  if (globalClient) {
    globalClient.destroy()
    globalClient = null
  }
}

/**
 * 聚合搜索状态
 */
export interface AggregatedSearchState {
  /** 搜索结果 */
  results: VideoItem[]
  /** 是否正在加载 */
  loading: boolean
  /** 进度信息 */
  progress: {
    completed: number
    total: number
  }
  /** 错误信息 */
  error: string | null
}

/**
 * 聚合搜索Hook返回值
 */
export interface UseAggregatedSearchReturn extends AggregatedSearchState {
  /** 执行搜索 */
  search: (query: string, sources: VideoSource[]) => Promise<void>
  /** 中止搜索 */
  abort: () => void
  /** 清空结果 */
  clear: () => void
}

/**
 * 聚合搜索Hook
 * @param config 可选的客户端配置
 */
export function useAggregatedSearch(config?: CmsClientConfig): UseAggregatedSearchReturn {
  const client = useMemo(() => getCmsClient(config), [config])
  const abortRef = useRef<AbortController | null>(null)

  const [state, setState] = useState<AggregatedSearchState>({
    results: [],
    loading: false,
    progress: { completed: 0, total: 0 },
    error: null,
  })

  // 订阅事件
  useEffect(() => {
    const unsubResult = client.on('search:result', (event: SearchResultEvent) => {
      setState(prev => ({
        ...prev,
        results: [...prev.results, ...event.items],
      }))
    })

    const unsubProgress = client.on('search:progress', (event: SearchProgressEvent) => {
      setState(prev => ({
        ...prev,
        progress: { completed: event.completed, total: event.total },
      }))
    })

    const unsubError = client.on('search:error', (event: SearchErrorEvent) => {
      setState(prev => ({
        ...prev,
        error: event.error.message,
      }))
    })

    return () => {
      unsubResult()
      unsubProgress()
      unsubError()
    }
  }, [client])

  const search = useCallback(
    async (query: string, sources: VideoSource[]) => {
      // 中止之前的搜索
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      setState({
        results: [],
        loading: true,
        progress: { completed: 0, total: sources.length },
        error: null,
      })

      try {
        await client.aggregatedSearch(query, sources, 1, abortRef.current.signal)
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setState(prev => ({
            ...prev,
            error: (error as Error).message,
          }))
        }
      } finally {
        setState(prev => ({
          ...prev,
          loading: false,
        }))
      }
    },
    [client],
  )

  const abort = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const clear = useCallback(() => {
    setState({
      results: [],
      loading: false,
      progress: { completed: 0, total: 0 },
      error: null,
    })
  }, [])

  return {
    ...state,
    search,
    abort,
    clear,
  }
}

/**
 * 视频详情状态
 */
export interface VideoDetailState {
  /** 详情结果 */
  detail: DetailResult | null
  /** 是否正在加载 */
  loading: boolean
  /** 错误信息 */
  error: string | null
}

/**
 * 视频详情Hook返回值
 */
export interface UseVideoDetailReturn extends VideoDetailState {
  /** 获取详情 */
  fetchDetail: (id: string, source: VideoSource) => Promise<DetailResult | null>
  /** 清空详情 */
  clear: () => void
}

/**
 * 视频详情Hook
 * @param config 可选的客户端配置
 */
export function useVideoDetail(config?: CmsClientConfig): UseVideoDetailReturn {
  const client = useMemo(() => getCmsClient(config), [config])

  const [state, setState] = useState<VideoDetailState>({
    detail: null,
    loading: false,
    error: null,
  })

  const fetchDetail = useCallback(
    async (id: string, source: VideoSource): Promise<DetailResult | null> => {
      setState({
        detail: null,
        loading: true,
        error: null,
      })

      try {
        const result = await client.getDetail(id, source)

        setState({
          detail: result,
          loading: false,
          error: result.success ? null : result.error || '获取详情失败',
        })

        return result
      } catch (error) {
        const errorMessage = (error as Error).message
        setState({
          detail: null,
          loading: false,
          error: errorMessage,
        })
        return null
      }
    },
    [client],
  )

  const clear = useCallback(() => {
    setState({
      detail: null,
      loading: false,
      error: null,
    })
  }, [])

  return {
    ...state,
    fetchDetail,
    clear,
  }
}

/**
 * 获取CmsClient实例的Hook
 * @param config 可选的客户端配置
 */
export function useCmsClient(config?: CmsClientConfig): CmsClient {
  return useMemo(() => getCmsClient(config), [config])
}
