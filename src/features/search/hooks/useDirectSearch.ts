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
  const [hasMore, setHasMore] = useState(true)
  const [searchProgress, setSearchProgress] = useState({ completed: 0, total: 0 })
  const abortCtrlRef = useRef<AbortController | null>(null)
  const timeOutTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { videoAPIs } = useApiStore()
  const { getCachedResultByKey, updateCacheForSource } = useSearchStore()
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

    // 4. Split sources into cached vs needing-fetch
    const apisToFetch: typeof selectedAPIs = []
    
    // Initial results from cache
    let initialResults: VideoItem[] = []
    let initialCompletedCount = 0
    // To track progress better, we assume 1 source = 1 unit of work
    
    selectedAPIs.forEach(api => {
        const cachedRes = getCachedResultByKey(api.id, keyword, page)
        if (cachedRes) {
            initialResults = [...initialResults, ...cachedRes]
            initialCompletedCount++
        } else {
            apisToFetch.push(api)
        }
    })
    
    // Sort initial results to maybe give consistent order? 
    // Not strictly needed but good for UI stability if cache returns in random order
    
    // Set initial state
    setDirectResults(prev => page === 1 ? initialResults : [...prev, ...initialResults])
    setSearchProgress({ completed: initialCompletedCount, total: selectedAPIs.length })
    
    // If all cached, done
    if (apisToFetch.length === 0) {
        setDirectLoading(false)
        if (page === 1) {
            // Restore hasMore based on results count? Or just assume true?
            // With granular cache, we don't store "isComplete" for the whole query.
            // But if we returned results, we are good.
            // If result count < size * page? 
            // We'll leave hasMore as is (true) or maybe set false if 0 results?
            if (initialResults.length === 0) setHasMore(false)
        }
        
        if (timeOutTimer.current) {
          clearTimeout(timeOutTimer.current)
          timeOutTimer.current = null
        }
        return
    }

    // Subscribe to incremental results
    const unsubResult = cmsClient.on('search:result', (event: SearchResultEvent) => {
      // hasNewResults = true // Not used much
      setDirectResults(prev => {
        const mergedRes = [...prev, ...event.items]
        if (mergedRes.length >= PAGE_SIZE * page) setDirectLoading(false)
        return mergedRes
      })

      // Identify which source finished from the items?
      // Actually aggregatedSearch doesn't easily tell us "Source A finished" until the end 
      // UNLESS cms-core emits per-source completion events (it often doesn't, just result chunks).
      // But we can approximate progress if items arrive.
      // Wait, look at line 102 below, the original code tried to guess completion based on source_code.
      
      const newApiIds = Array.from(
        new Set(
          event.items
            .map((r: VideoItem) => r.source_code)
            .filter((id: string | undefined): id is string => !!id),
        ),
      )
      
      // We don't have an easy way to verify source completion mid-stream without explicit events
      // So we might just rely on the final promise result for "completion"
      // But we can update cache "optimistically" or wait for final?
      // Since useDirectSearch is about display, cache update should happen when we are sure.
    })

    const searchPromise = cmsClient
      .aggregatedSearch(keyword, apisToFetch, page, controller.signal)
      .then((allResults: VideoItem[]) => {
         // Now we know all `apisToFetch` are done.
         // We should update cache for each of them.
         
         // Group results by source
         const resultsBySource: Record<string, VideoItem[]> = {}
         apisToFetch.forEach(api => { resultsBySource[api.id] = [] }) // init
         
         allResults.forEach(item => {
             if (item.source_code && resultsBySource[item.source_code]) {
                 resultsBySource[item.source_code].push(item)
             }
         })
         
         // Write to store
         Object.entries(resultsBySource).forEach(([sourceId, results]) => {
             updateCacheForSource(sourceId, keyword, page, results)
         })

         // Progress update
         setSearchProgress(prev => ({ 
             completed: initialCompletedCount + apisToFetch.length, 
             total: selectedAPIs.length 
         }))

         if (allResults.length === 0 && initialResults.length === 0) {
            setHasMore(false)
         }
      })
      .catch(error => {
        if ((error as Error).name !== 'AbortError') {
          console.error('直连搜索失败:', error)
          // Don't toast error aggressively
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
  }, [selectedAPIs, getCachedResultByKey, updateCacheForSource, cmsClient])

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
