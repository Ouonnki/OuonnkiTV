interface SearchHistoryItem {
  id: string
  content: string
  createdAt: number
  updatedAt: number
}

type SearchHistory = SearchHistoryItem[]

export type { SearchHistoryItem, SearchHistory }
