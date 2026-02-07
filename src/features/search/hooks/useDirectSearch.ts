import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { type VideoItem, type SearchResultEvent, type Pagination } from '@ouonnki/cms-core'
import { useApiStore } from '@/shared/store/apiStore'
import { useCmsClient } from '@/shared/hooks'
import { PaginationConfig } from '@/shared/config/video.config'

const PAGE_SIZE = 20

// 源分页信息缓存结构
interface SourcePaginationInfo {
  totalPages: number
  totalResults: number
}

export function useDirectSearch() {
  const [directResults, setDirectResults] = useState<VideoItem[]>([])
  const [directLoading, setDirectLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [searchProgress, setSearchProgress] = useState({ completed: 0, total: 0 })
  const [cmsPagination, setCmsPagination] = useState<Pagination>({
    page: 1,
    totalPages: 0,
    totalResults: 0,
  })
  // 缓存每个源的分页信息，用于判断是否需要请求
  const sourcePaginationCacheRef = useRef<Map<string, SourcePaginationInfo>>(new Map())
  const abortCtrlRef = useRef<AbortController | null>(null)
  const timeOutTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentPageRef = useRef(1)

  const { videoAPIs } = useApiStore()
  const cmsClient = useCmsClient()

  const selectedAPIs = useMemo(() => {
    return videoAPIs.filter(api => api.isEnabled)
  }, [videoAPIs])

  const fetchDirectSearch = useCallback(async (keyword: string, page: number = 1) => {
    if (!keyword || selectedAPIs.length === 0) return

    abortCtrlRef.current?.abort()
    const controller = new AbortController()
    abortCtrlRef.current = controller
    currentPageRef.current = page

    setDirectLoading(true)
    setSearchProgress({ completed: 0, total: selectedAPIs.length })

    if (timeOutTimer.current) {
      clearTimeout(timeOutTimer.current)
      timeOutTimer.current = null
    }
    timeOutTimer.current = setTimeout(() => {
      setDirectLoading(false)
      timeOutTimer.current = null
    }, PaginationConfig.maxRequestTimeout)

    // 第1页时清空分页缓存
    if (page === 1) {
      sourcePaginationCacheRef.current.clear()
    }

    // 根据缓存判断哪些源需要跳过
    const cachedSources = sourcePaginationCacheRef.current
    const sourcesToFetch = selectedAPIs.filter(source => {
      const cached = cachedSources.get(source.id)
      if (!cached) return true // 没有缓存信息，需要请求
      return page <= cached.totalPages // 有缓存但页码未超出，需要请求
    })

    // 如果所有源都已超出页码，直接设置完成状态
    if (sourcesToFetch.length === 0) {
      setDirectLoading(false)
      setSearchProgress({ completed: selectedAPIs.length, total: selectedAPIs.length })
      setHasMore(false)
      if (timeOutTimer.current) {
        clearTimeout(timeOutTimer.current)
        timeOutTimer.current = null
      }
      return
    }

    // 用于累积分页信息
    const paginationMap = new Map<string, Pagination>()

    // Subscribe to incremental results
    const unsubResult = cmsClient.on('search:result', (event: SearchResultEvent) => {
      // 更新分页缓存
      if (event.pagination && event.source) {
        const cached = cachedSources.get(event.source.id)
        const paginationInfo: SourcePaginationInfo = {
          totalPages: event.pagination.totalPages,
          totalResults: event.pagination.totalResults,
        }
        // 只有当分页信息更新时才记录（处理空结果返回最后一页分页信息的情况）
        if (!cached || event.pagination.page <= event.pagination.totalPages) {
          cachedSources.set(event.source.id, paginationInfo)
        }
      }

      setDirectResults(prev => {
        // 累积加载：第1页替换，第2页及以后追加
        const mergedRes =
          event.pagination?.page === 1 ? event.items : [...prev, ...event.items]
        if (mergedRes.length >= PAGE_SIZE * page) setDirectLoading(false)
        return mergedRes
      })

      // 收集分页信息
      if (event.pagination && event.source) {
        paginationMap.set(event.source.id, event.pagination)

        // 聚合分页信息：累加总数，取最大页数
        let totalResults = 0
        let maxTotalPages = 0
        // 合并缓存和新请求的分页信息
        const allSources = new Set([
          ...cachedSources.keys(),
          ...paginationMap.keys(),
        ])
        allSources.forEach(sourceId => {
          const pag =
            paginationMap.get(sourceId) ||
            (cachedSources.get(sourceId) as Pagination | undefined)
          if (pag) {
            totalResults += pag.totalResults
            if (pag.totalPages > maxTotalPages) {
              maxTotalPages = pag.totalPages
            }
          }
        })

        setCmsPagination({
          page: event.pagination.page,
          totalPages: maxTotalPages,
          totalResults,
        })

        // 判断是否还有更多页
        setHasMore(event.pagination.page < maxTotalPages)
      }
    })

    const searchPromise = cmsClient
      .aggregatedSearch(keyword, sourcesToFetch, page, controller.signal)
      .then((allResults: VideoItem[]) => {
        // Progress update
        setSearchProgress({
          completed: selectedAPIs.length - (selectedAPIs.length - sourcesToFetch.length),
          total: selectedAPIs.length,
        })

        if (allResults.length === 0 && page === 1) {
          setHasMore(false)
        }
      })
      .catch(error => {
        if ((error as Error).name !== 'AbortError') {
          console.error('直连搜索失败:', error)
        }
      })
      .finally(() => {
        unsubResult()
        setDirectLoading(false)

        if (timeOutTimer.current) {
          clearTimeout(timeOutTimer.current)
          timeOutTimer.current = null
        }
      })

    if (page === 1) {
      toast.promise(searchPromise, {
        loading: '持续搜索内容中......',
        success: '搜索完成',
        error: '部分搜索失败',
      })
    } else {
      searchPromise
    }
  }, [selectedAPIs, cmsClient])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortCtrlRef.current?.abort()
      if (timeOutTimer.current) {
        clearTimeout(timeOutTimer.current)
      }
    }
  }, [])

  return {
    directResults,
    directLoading,
    hasMore,
    searchProgress,
    cmsPagination,
    startDirectSearch: fetchDirectSearch,
    setDirectResults,
  }
}
