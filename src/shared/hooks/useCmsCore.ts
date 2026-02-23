import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import {
  createCmsClient,
  createDirectStrategy,
  createUrlPrefixProxyStrategy,
  type CmsClient,
  type VideoSource,
  type VideoItem,
  type DetailResult,
  type SearchResult,
  type CmsClientConfig,
  type SearchResultEvent,
  type SearchProgressEvent,
  type SearchErrorEvent,
} from '@ouonnki/cms-core'
import { useSettingStore } from '@/shared/store/settingStore'
import { normalizeProxyPrefix } from '@/shared/config/api.config'

let globalClient: CmsClient | null = null
let globalNetworkKey: string | null = null

function getCmsClient(config?: CmsClientConfig): CmsClient {
  const { network } = useSettingStore.getState()
  const normalizedProxyUrl = normalizeProxyPrefix(network.proxyUrl)
  const networkKey = [
    network.concurrencyLimit,
    network.isProxyEnabled ? 'proxy' : 'direct',
    network.isProxyEnabled ? normalizedProxyUrl : '',
  ].join('|')

  // 当网络设置变化时重建单例
  if (globalClient && globalNetworkKey !== networkKey) {
    globalClient.destroy()
    globalClient = null
  }

  if (!globalClient) {
    globalNetworkKey = networkKey
    globalClient = createCmsClient({
      proxyStrategy: network.isProxyEnabled
        ? createUrlPrefixProxyStrategy(normalizedProxyUrl)
        : createDirectStrategy(),
      concurrencyLimit: network.concurrencyLimit,
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
    globalNetworkKey = null
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
  const networkKey = useSettingStore(
    state =>
      `${state.network.concurrencyLimit}|${state.network.isProxyEnabled}|${state.network.proxyUrl}`,
  )
  const client = useMemo(() => {
    void networkKey
    return getCmsClient(config)
  }, [config, networkKey])
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
  const networkKey = useSettingStore(
    state =>
      `${state.network.concurrencyLimit}|${state.network.isProxyEnabled}|${state.network.proxyUrl}`,
  )
  const client = useMemo(() => {
    void networkKey
    return getCmsClient(config)
  }, [config, networkKey])

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
  const networkKey = useSettingStore(
    state =>
      `${state.network.concurrencyLimit}|${state.network.isProxyEnabled}|${state.network.proxyUrl}`,
  )
  return useMemo(() => {
    void networkKey
    return getCmsClient(config)
  }, [config, networkKey])
}

/**
 * CMS 视频列表状态
 */
export interface CmsVideoListState {
  /** 视频列表 */
  items: VideoItem[]
  /** 是否正在加载 */
  loading: boolean
  /** 错误信息 */
  error: string | null
}

/**
 * CMS 视频列表 Hook
 * 从指定视频源获取推荐/最新视频列表（不带搜索关键词）
 */
export function useCmsVideoList(source: VideoSource | null, config?: CmsClientConfig): CmsVideoListState {
  const networkKey = useSettingStore(
    state =>
      `${state.network.concurrencyLimit}|${state.network.isProxyEnabled}|${state.network.proxyUrl}`,
  )
  const client = useMemo(() => {
    void networkKey
    return getCmsClient(config)
  }, [config, networkKey])

  const [state, setState] = useState<CmsVideoListState>({
    items: [],
    loading: false,
    error: null,
  })

  useEffect(() => {
    if (!source || !source.isEnabled) {
      setState({ items: [], loading: false, error: null })
      return
    }

    let cancelled = false

    const fetchList = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }))

      try {
        const result: SearchResult = await client.listVideos(source)

        if (cancelled) return

        if (result.success) {
          setState({ items: result.items, loading: false, error: null })
        } else {
          setState({ items: [], loading: false, error: result.error || '获取列表失败' })
        }
      } catch (error) {
        if (cancelled) return
        setState({
          items: [],
          loading: false,
          error: error instanceof Error ? error.message : '请求失败',
        })
      }
    }

    fetchList()

    return () => {
      cancelled = true
    }
  }, [client, source])

  return state
}
