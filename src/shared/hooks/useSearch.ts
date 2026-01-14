import { useNavigate } from 'react-router'
import { useSearchStore } from '@/shared/store/searchStore'
import { trackEvent } from '@/shared/config/analytics.config'

export const useSearch = () => {
  const navigate = useNavigate()

  // 从 zustand store 获取状态和操作
  const { query: search, setQuery: setSearch, addSearchHistoryItem, clearQuery } = useSearchStore()

  const searchMovie = (query: string, isNavigating: boolean = true) => {
    if (query.trim().length > 0) {
      // 设置当前搜索查询
      setSearch(query)

      // 添加到搜索历史
      addSearchHistoryItem(query)

      // 跟踪搜索事件
      trackEvent('search', {
        query: query,
        timestamp: new Date().toISOString(),
      })

      // 导航到搜索页面
      if (isNavigating) {
        navigate(`/search?q=${encodeURIComponent(query)}`)
      }
    }
  }

  const clearSearch = () => {
    clearQuery()
  }

  return {
    search,
    setSearch,
    searchMovie,
    clearSearch,
  }
}
