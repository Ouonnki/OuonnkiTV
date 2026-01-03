import { useSearchStore } from '@/store/searchStore'

export const useSearchHistory = () => {
  // 从 zustand store 获取搜索历史相关的状态和操作
  const { searchHistory, addSearchHistoryItem, removeSearchHistoryItem, clearSearchHistory } =
    useSearchStore()

  return {
    searchHistory,
    addSearchHistoryItem,
    removeSearchHistoryItem,
    clearSearchHistory,
  }
}
