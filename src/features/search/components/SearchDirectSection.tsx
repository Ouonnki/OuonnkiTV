import { useEffect } from 'react'
import { useDirectSearch } from '../hooks/useDirectSearch'
import { SearchResultsGrid } from './SearchResultsGrid'

interface SearchDirectSectionProps {
  query: string
}

export function SearchDirectSection({ query }: SearchDirectSectionProps) {
  const { directResults, directLoading, searchProgress, startDirectSearch } =
    useDirectSearch()

  // 监听 query 变化触发搜索
  useEffect(() => {
    if (query) {
      startDirectSearch(query, 1)
    }
  }, [query, startDirectSearch])

  // 如果没有 query，不渲染内容（或者可以渲染一些空状态/提示）
  if (!query) return null

  return (
    <div className="flex flex-col gap-6">
      <section>
        <SearchResultsGrid
          mode="direct"
          directResults={directResults}
          loading={directLoading}
          searchProgress={searchProgress}
        />
      </section>
    </div>
  )
}
