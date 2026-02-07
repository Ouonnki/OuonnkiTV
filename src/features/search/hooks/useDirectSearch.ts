import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { type VideoItem, type SearchResultEvent } from '@ouonnki/cms-core'
import { useApiStore } from '@/shared/store/apiStore'
import { useCmsClient } from '@/shared/hooks'
import { PaginationConfig } from '@/shared/config/video.config'

const PAGE_SIZE = 20

export function useDirectSearch() {
  const [directResults, setDirectResults] = useState<VideoItem[]>([])
  const [directLoading, setDirectLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [searchProgress, setSearchProgress] = useState({ completed: 0, total: 0 })
  const abortCtrlRef = useRef<AbortController | null>(null)
  const timeOutTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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

    // Subscribe to incremental results
    const unsubResult = cmsClient.on('search:result', (event: SearchResultEvent) => {
      setDirectResults(prev => {
        const mergedRes = [...prev, ...event.items]
        if (mergedRes.length >= PAGE_SIZE * page) setDirectLoading(false)
        return mergedRes
      })
    })

    const searchPromise = cmsClient
      .aggregatedSearch(keyword, selectedAPIs, page, controller.signal)
      .then((allResults: VideoItem[]) => {
        // Progress update
        setSearchProgress({ completed: selectedAPIs.length, total: selectedAPIs.length })

        if (allResults.length === 0) {
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
          error: '部分搜索失败'
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
    startDirectSearch: fetchDirectSearch,
    setDirectResults
  }
}
