import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useTmdbSearch, useTmdbGenres, useTmdbDiscover } from '@/shared/hooks/useTmdb'
import { useTmdbStore } from '@/shared/store/tmdbStore'
import { CategoryFilterSection } from './CategoryFilterSection'
import { SearchResultsGrid } from './SearchResultsGrid'
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll'

interface SearchTmdbSectionProps {
  query: string
}

export function SearchTmdbSection({ query }: SearchTmdbSectionProps) {
  // 新增：分页状态
  const [currentPage, setCurrentPage] = useState(1)

  const {
    search: tmdbSearch,
    filteredResults: tmdbFilteredResults,
    filterOptions,
    loading: tmdbLoading,
    pagination: tmdbPagination,
    setFilter,
    clearFilter,
  } = useTmdbSearch()

  const { movieGenres, tvGenres } = useTmdbGenres()

  const {
    results: discoverResults,
    loading: discoverLoading,
    pagination: discoverPagination,
    fetchDiscover,
  } = useTmdbDiscover()

  const countries = useTmdbStore(s => s.availableFilterOptions.countries)
  const years = useTmdbStore(s => s.availableFilterOptions.years)
  const fetchGenresAndCountries = useTmdbStore(s => s.fetchGenresAndCountries)

  // 初始化时获取分类和国家列表
  useEffect(() => {
    fetchGenresAndCountries()
  }, [fetchGenresAndCountries])

  // 筛选条件变化时重置分页并重新获取数据（Discover 模式）
  useEffect(() => {
    setCurrentPage(1)
    // 如果没有搜索词，重新获取 Discover 数据
    if (!query) {
      fetchDiscover(1)
    }
  }, [filterOptions, query, fetchDiscover])

  // 无搜索词时加载 discover 数据
  useEffect(() => {
    if (!query) {
      setCurrentPage(1)
      fetchDiscover(1)
    }
  }, [query, fetchDiscover])

  // 执行搜索
  useEffect(() => {
    if (query) {
      setCurrentPage(1)
      tmdbSearch(query, 1)
    }
  }, [query, tmdbSearch])

  // 判断当前是否有更多
  const pagination = query ? tmdbPagination : discoverPagination
  const hasMore = pagination.page < pagination.totalPages

  // 加载下一页
  const handleLoadMore = useCallback(async () => {
    const nextPage = currentPage + 1

    // 先加载数据，完成后再更新 currentPage，避免不必要的重新渲染
    if (query) {
      await tmdbSearch(query, nextPage)
    } else {
      await fetchDiscover(nextPage)
    }

    // 数据加载完成后再更新 currentPage
    setCurrentPage(nextPage)
  }, [currentPage, query, tmdbSearch, fetchDiscover])

  // 滚动加载
  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    isLoading: tmdbLoading || discoverLoading,
    onLoadMore: handleLoadMore,
  })

  return (
    <motion.div
      className="flex flex-col gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      {/* 分类筛选区域 */}
      <section>
        <CategoryFilterSection
          movieGenres={movieGenres}
          tvGenres={tvGenres}
          countries={countries}
          years={years}
          filterOptions={filterOptions}
          onFilterChange={setFilter}
          onClear={clearFilter}
        />
      </section>

      {/* 搜索结果区域 */}
      <section>
        {query ? (
          <SearchResultsGrid
            mode="tmdb"
            tmdbResults={tmdbFilteredResults}
            loading={tmdbLoading}
            totalResults={tmdbPagination.totalResults}
            hasMore={hasMore}
            sentinelRef={sentinelRef}
          />
        ) : (
          // 无搜索词时显示 discover 结果
          <SearchResultsGrid
            mode="tmdb"
            tmdbResults={discoverResults}
            loading={discoverLoading}
            hasMore={hasMore}
            sentinelRef={sentinelRef}
          />
        )}
      </section>
    </motion.div>
  )
}
