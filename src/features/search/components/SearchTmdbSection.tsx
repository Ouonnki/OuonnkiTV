import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTmdbSearch, useTmdbGenres, useTmdbDiscover } from '@/shared/hooks/useTmdb'
import { useTmdbStore } from '@/shared/store/tmdbStore'
import { CategoryFilterSection } from './CategoryFilterSection'
import { SearchResultsGrid } from './SearchResultsGrid'

const PAGE_SIZE = 20

interface SearchTmdbSectionProps {
  query: string
}

export function SearchTmdbSection({ query }: SearchTmdbSectionProps) {
  // ... existing state ...
  const [tmdbPage, setTmdbPage] = useState(1)
  const [discoverPage, setDiscoverPage] = useState(1)

  // TMDB Hooks
  const {
    search: tmdbSearch,
    filteredResults: tmdbFilteredResults,
    filterOptions,
    loading: tmdbLoading,
    setFilter,
    clearFilter,
  } = useTmdbSearch()

  const { movieGenres, tvGenres } = useTmdbGenres()

  // Discover Hook（无搜索词时使用）
  const {
    results: discoverResults,
    pagination: discoverPagination,
    loading: discoverLoading,
    fetchDiscover,
  } = useTmdbDiscover()

  // 获取国家列表
  const countries = useTmdbStore(s => s.availableFilterOptions.countries)
  const years = useTmdbStore(s => s.availableFilterOptions.years)
  const fetchGenresAndCountries = useTmdbStore(s => s.fetchGenresAndCountries)

  // 初始化时获取分类和国家列表
  useEffect(() => {
    fetchGenresAndCountries()
  }, [fetchGenresAndCountries])

  // 无搜索词时加载 discover 数据
  useEffect(() => {
    if (!query) {
      fetchDiscover(discoverPage)
    }
  }, [query, discoverPage, fetchDiscover])

  // 筛选条件变化时重新加载 discover 数据
  useEffect(() => {
    if (!query) {
      setDiscoverPage(1)
      fetchDiscover(1)
    }
  }, [filterOptions, query, fetchDiscover])

  // 执行搜索
  useEffect(() => {
    if (query) {
      setTmdbPage(1) // 重置分页
      tmdbSearch(query)
    }
  }, [query, tmdbSearch])

  // 计算 TMDB 分页（使用筛选后的结果）
  const tmdbPaginatedResults = useMemo(() => {
    const start = (tmdbPage - 1) * PAGE_SIZE
    return tmdbFilteredResults.slice(start, start + PAGE_SIZE)
  }, [tmdbFilteredResults, tmdbPage])

  const tmdbTotalPages = useMemo(() => {
    return Math.ceil(tmdbFilteredResults.length / PAGE_SIZE)
  }, [tmdbFilteredResults.length])

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
            tmdbResults={tmdbPaginatedResults}
            directResults={[]}
            loading={tmdbLoading}
            currentPage={tmdbPage}
            totalPages={tmdbTotalPages}
            onPageChange={page => {
              setTmdbPage(page)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        ) : (
          // 无搜索词时显示 discover 结果
          <SearchResultsGrid
            mode="tmdb"
            tmdbResults={discoverResults}
            loading={discoverLoading}
            currentPage={discoverPage}
            totalPages={discoverPagination.totalPages}
            onPageChange={page => {
              setDiscoverPage(page)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        )}
      </section>
    </motion.div>
  )
}
