import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { type VideoItem, type SearchResultEvent } from '@ouonnki/cms-core'
import { useApiStore } from '@/shared/store/apiStore'
import { useSearchStore } from '@/shared/store/searchStore'
import { useCmsClient } from '@/shared/hooks'
import { PaginationConfig } from '@/shared/config/video.config'

const PAGE_SIZE = 20

export function useDirectSearch() {
  const [directResults, setDirectResults] = useState<VideoItem[]>([])
  const [directLoading, setDirectLoading] = useState(false)
  const [searchProgress, setSearchProgress] = useState({ completed: 0, total: 0 })
  const abortCtrlRef = useRef<AbortController | null>(null)
  const timeOutTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { videoAPIs } = useApiStore()
  const { getCachedResults, updateCachedResults } = useSearchStore()
  const cmsClient = useCmsClient()

  const selectedAPIs = useMemo(() => {
    return videoAPIs.filter(api => api.isEnabled)
  }, [videoAPIs])

  const fetchDirectSearch = useCallback(async (keyword: string) => {
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

    // Check cache
    const cached = getCachedResults(keyword)
    if (cached?.isComplete) {
      setDirectResults(cached.results)
      setDirectLoading(false)
      if (timeOutTimer.current) {
        clearTimeout(timeOutTimer.current)
        timeOutTimer.current = null
      }
      return
    }

    if (cached) {
      setDirectResults(cached.results)
    } else {
      setDirectResults([])
    }

    let completedCount = cached?.completedApiIds.length || 0
    const completedApiIds = cached?.completedApiIds ? [...cached.completedApiIds] : []
    const apisToSearch = cached
      ? selectedAPIs.filter(api => !cached.completedApiIds.includes(api.id))
      : selectedAPIs

    if (apisToSearch.length === 0) {
      setDirectLoading(false)
      if (timeOutTimer.current) {
        clearTimeout(timeOutTimer.current)
        timeOutTimer.current = null
      }
      return
    }

    let hasNewResults = false

    // Subscribe to incremental results
    const unsubResult = cmsClient.on('search:result', (event: SearchResultEvent) => {
      hasNewResults = true
      setDirectResults(prev => {
        const mergedRes = [...prev, ...event.items]
        if (mergedRes.length >= PAGE_SIZE) setDirectLoading(false)
        return mergedRes
      })

      const newApiIds = Array.from(
        new Set(
          event.items
            .map((r: VideoItem) => r.source_code)
            .filter((id: string | undefined): id is string => !!id),
        ),
      )
      newApiIds.forEach(id => {
        if (!completedApiIds.includes(id)) {
          completedApiIds.push(id)
          completedCount++
          setSearchProgress(prev => ({ ...prev, completed: completedCount }))
        }
      })

      updateCachedResults(keyword, event.items, completedApiIds, false)
    })

    const searchPromise = cmsClient
      .aggregatedSearch(keyword, apisToSearch, controller.signal)
      .then((allResults: VideoItem[]) => {
        const allApiIds = apisToSearch.map(api => api.id)
        const finalApiIds = Array.from(new Set([...completedApiIds, ...allApiIds]))

        const selectedApiIds = selectedAPIs.map(api => api.id)
        const isComplete = selectedApiIds.every(id => finalApiIds.includes(id))

        // Note: We might want access current state here, but in callback logic it's tricky.
        // For cache update, we rely on what we just fetched + previous known state if needed,
        // but here we pass fresh results for updateCachedResults to merge.
        updateCachedResults(keyword, hasNewResults ? [] : allResults, finalApiIds, isComplete)

        // We can't easily access the *latest* directResults state here without ref or functional update
        // but for the toast message, we can approximate or just show success.
        // To be accurate with count, we'd need to know the Total.
        // Simple fix: just show "Search Completed"
        toast.success(`搜索完成！`)
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

    toast.promise(searchPromise, {
      loading: '持续搜索内容中......',
    })
  }, [selectedAPIs, getCachedResults, updateCachedResults, cmsClient])

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
    searchProgress,
    startDirectSearch: fetchDirectSearch,
    setDirectResults
  }
}
