import { useSearchStore } from '@/shared/store/searchStore'
import { useSettingStore } from '@/shared/store/settingStore'

export const useSearchHistory = () => {
  const { searchHistory, addSearchHistoryItem, removeSearchHistoryItem, clearSearchHistory } =
    useSearchStore()
  const isSearchHistoryVisible = useSettingStore(state => state.search.isSearchHistoryVisible)

  return {
    // 当 isSearchHistoryVisible 为 false 时返回空数组，阻止搜索历史下拉展示
    searchHistory: isSearchHistoryVisible ? searchHistory : [],
    addSearchHistoryItem,
    removeSearchHistoryItem,
    clearSearchHistory,
  }
}
