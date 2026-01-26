import { useState, useEffect, useMemo } from 'react'
import { useDirectSearch } from '../hooks/useDirectSearch'
import { SearchResultsGrid } from './SearchResultsGrid'

const PAGE_SIZE = 20

interface SearchDirectSectionProps {
  query: string
}

export function SearchDirectSection({ query }: SearchDirectSectionProps) {
  const [directPage, setDirectPage] = useState(1)

  const { 
    directResults, 
    directLoading, 
    searchProgress, 
    startDirectSearch 
  } = useDirectSearch()

  // 监听 query 变化触发搜索
  useEffect(() => {
    if (query) {
      setDirectPage(1)
      startDirectSearch(query)
    }
  }, [query, startDirectSearch])

  // 计算直连搜索分页
  const directTotalPages = useMemo(() => {
    return Math.ceil(directResults.length / PAGE_SIZE)
  }, [directResults.length])

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
          totalPages={directTotalPages}
          onPageChange={page => {
            setDirectPage(page)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          searchProgress={searchProgress}
        />
      </section>
    </div>
  )
}
