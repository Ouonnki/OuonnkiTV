import { useState, useRef, useCallback } from 'react'
import { getTmdbClient, normalizeToMediaItem } from '@/shared/lib/tmdb'
import { useSettingStore } from '@/shared/store/settingStore'
import { isTmdbEnabled } from '@/shared/hooks/useTmdbMode'
import type { TmdbMediaItem } from '@/shared/types/tmdb'

type TmdbSearchMultiParams = Parameters<ReturnType<typeof getTmdbClient>['search']['multi']>[0]
type TmdbSearchLanguage = NonNullable<TmdbSearchMultiParams['language']>

// 搜索建议最大数量
const MAX_SUGGESTIONS = 9
// 防抖延迟时间 (毫秒)
const DEBOUNCE_DELAY = 100

interface UseSearchSuggestionsReturn {
  suggestions: TmdbMediaItem[]
  isLoading: boolean
  fetchSuggestions: (query: string) => void
  clearSuggestions: () => void
}

/**
 * 搜索建议 hook
 * 使用 TMDB search.multi API 获取搜索建议，带防抖功能
 */
export function useSearchSuggestions(): UseSearchSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<TmdbMediaItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 防抖定时器引用
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // 用于取消过期请求的标识
  const requestIdRef = useRef(0)

  const fetchSuggestions = useCallback((query: string) => {
    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // TMDB 未启用时不提供搜索建议
    if (!isTmdbEnabled()) {
      setSuggestions([])
      setIsLoading(false)
      return
    }

    // 如果查询为空，直接清空建议
    if (!query.trim()) {
      setSuggestions([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    // 设置防抖定时器
    debounceTimerRef.current = setTimeout(async () => {
      const currentRequestId = ++requestIdRef.current

      try {
        const client = getTmdbClient()
        const res = await client.search.multi({
          query: query.trim(),
          page: 1,
          language: useSettingStore.getState().system.tmdbLanguage as TmdbSearchLanguage,
          include_adult: false,
        })

        // 检查请求是否过期
        if (currentRequestId !== requestIdRef.current) {
          return
        }

        // 筛选电影和剧集，转换格式，限制数量
        const results: TmdbMediaItem[] = res.results
          .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
          .slice(0, MAX_SUGGESTIONS)
          .map(item =>
            normalizeToMediaItem(item as unknown as Record<string, unknown>, item.media_type),
          )

        setSuggestions(results)
      } catch (error) {
        console.error('Failed to fetch search suggestions:', error)
        // 静默失败，不影响用户体验
        if (currentRequestId === requestIdRef.current) {
          setSuggestions([])
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false)
        }
      }
    }, DEBOUNCE_DELAY)
  }, [])

  const clearSuggestions = useCallback(() => {
    // 清除定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    // 使请求过期
    requestIdRef.current++
    setSuggestions([])
    setIsLoading(false)
  }, [])

  return {
    suggestions,
    isLoading,
    fetchSuggestions,
    clearSuggestions,
  }
}
