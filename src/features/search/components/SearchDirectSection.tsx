import { useState, useEffect } from 'react'
import { useDirectSearch } from '../hooks/useDirectSearch'
import { SearchResultsGrid } from './SearchResultsGrid'

interface SearchDirectSectionProps {
  query: string
}

export function SearchDirectSection({ query }: SearchDirectSectionProps) {
  const [directPage, setDirectPage] = useState(1)

  const {
    directResults,
    directLoading,
    searchProgress,
    cmsPagination,
    startDirectSearch,
  } = useDirectSearch()

  // 监听 query 变化触发搜索
  useEffect(() => {
    if (query) {
      setDirectPage(1)
      startDirectSearch(query, 1)
    }
  }, [query, startDirectSearch])

  // 处理分页变更
  const handlePageChange = (page: number) => {
    setDirectPage(page)
    startDirectSearch(query, page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 如果没有 query，不渲染内容（或者可以渲染一些空状态/提示）
  if (!query) return null

  return (
    <div className="flex flex-col gap-6">
      <section>
        <SearchResultsGrid
          mode="direct"
          directResults={directResults}
          loading={directLoading}
          currentPage={directPage}
          totalPages={cmsPagination.totalPages}
          totalResults={cmsPagination.totalResults}
          onPageChange={handlePageChange}
          searchProgress={searchProgress}
        />
      </section>
    </div>
  )
}
