import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useDocumentTitle } from '@/shared/hooks'
import { useTmdbNowPlaying } from '@/shared/hooks/useTmdb'
import { useSearchStore } from '@/shared/store/searchStore'

import {
  SearchModeToggle,
  SearchHubInput,
  SearchTrending,
  SearchTmdbSection,
  SearchDirectSection,
  type SearchMode,
} from '../components'

/**
 * SearchHubView - 搜索中心视图
 * 支持两种搜索模式：智能检索（TMDB）和直连搜索（多源聚合）
 */
export default function SearchHubView() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const modeParam = searchParams.get('mode') as SearchMode | null

  // 搜索模式状态 - 直接从 URL 获取，作为 Single Source of Truth
  const mode: SearchMode = (modeParam || 'tmdb') as SearchMode

  const [isDirectCentered, setIsDirectCentered] = useState(false)

  // 延迟应用居中样式，等待大家都在搜出现后再下滑
  useEffect(() => {
    const shouldBeCentered = mode === 'direct' && !query
    if (shouldBeCentered) {
      const timer = setTimeout(() => setIsDirectCentered(true), 400)
      return () => clearTimeout(timer)
    } else {
      setIsDirectCentered(false) // 立即移除类名
    }
  }, [mode, query])

  // Sync query to search history
  const { addSearchHistoryItem } = useSearchStore()
  useEffect(() => {
    if (query.trim()) {
      addSearchHistoryItem(query.trim())
    }
  }, [query, addSearchHistoryItem])

  // Trending Hook（只用于热搜词展示，仍然保留在顶层）
  const { trending, refreshTrending } = useTmdbNowPlaying()

  // 初始化时获取热搜数据
  useEffect(() => {
    refreshTrending()
  }, [refreshTrending])

  // 动态更新页面标题
  useDocumentTitle(query ? `${query} - 搜索` : '搜索中心')

  // 处理模式切换
  const handleModeChange = useCallback(
    (newMode: SearchMode) => {
      setSearchParams(prev => {
        const params = new URLSearchParams(prev)
        params.set('mode', newMode)
        return params
      })
    },
    [setSearchParams],
  )

  // 处理搜索
  const handleSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return

      // 更新 URL
      setSearchParams(prev => {
        const params = new URLSearchParams(prev)
        params.set('q', searchQuery)
        params.set('mode', mode)
        return params
      })
    },
    [mode, setSearchParams],
  )

  // 处理清除搜索
  const handleClear = useCallback(() => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev)
      params.delete('q')
      return params
    })
  }, [setSearchParams])

  return (
    <div
      className={`flex flex-col gap-6 p-4 pb-8 transition-all duration-300 ${isDirectCentered ? 'min-h-[60vh] justify-center' : ''}`}
    >
      {/* 搜索区域 */}
      <motion.div
        layout
        className="flex w-full flex-col items-center gap-4"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* 模式切换 */}
        <motion.div layout>
          <SearchModeToggle mode={mode} onChange={handleModeChange} />
        </motion.div>

        {/* 搜索框 */}
        <motion.div layout className="flex w-full justify-center">
          <SearchHubInput initialQuery={query} onSearch={handleSearch} onClear={handleClear} />
        </motion.div>

        {/* 大家都在搜 */}
        <AnimatePresence mode="popLayout">
          {mode === 'direct' && !query && (
            <SearchTrending
              trending={trending}
              onSearch={handleSearch}
              isLoading={trending.length === 0}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* 结果区域 - 根据模式渲染不同组件 */}
      <div className="flex w-full flex-col gap-6">
        <AnimatePresence mode="wait">
          {mode === 'tmdb' ? (
            <SearchTmdbSection key="tmdb" query={query} />
          ) : (
            <SearchDirectSection key="direct" query={query} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
