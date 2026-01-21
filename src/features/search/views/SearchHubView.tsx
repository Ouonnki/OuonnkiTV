import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, History, Trash2, TrendingUp } from 'lucide-react'
import { type VideoItem, type SearchResultEvent } from '@ouonnki/cms-core'
import { toast } from 'sonner'

import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Popover, PopoverContent, PopoverAnchor } from '@/shared/components/ui/popover'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { useDocumentTitle, useSearchHistory, useSearchSuggestions, useCmsClient } from '@/shared/hooks'
import { useTmdbSearch, useTmdbGenres, useTmdbDiscover, useTmdbNowPlaying } from '@/shared/hooks/useTmdb'
import { useTmdbStore } from '@/shared/store/tmdbStore'
import { useApiStore } from '@/shared/store/apiStore'
import { useSearchStore } from '@/shared/store/searchStore'
import { PaginationConfig } from '@/shared/config/video.config'

import {
  SearchModeToggle,
  CategoryFilterSection,
  SearchResultsGrid,
  type SearchMode,
} from '../components'

// 动画变体
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// 每页显示数量
const PAGE_SIZE = 20

/**
 * SearchHubView - 搜索中心视图
 * 支持两种搜索模式：智能检索（TMDB）和直连搜索（多源聚合）
 */
export default function SearchHubView() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const modeParam = searchParams.get('mode') as SearchMode | null

  // 搜索模式状态
  const [mode, setMode] = useState<SearchMode>(modeParam || 'tmdb')
  const [inputValue, setInputValue] = useState(query)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 分页状态
  const [tmdbPage, setTmdbPage] = useState(1)
  const [directPage, setDirectPage] = useState(1)
  const [discoverPage, setDiscoverPage] = useState(1)

  // 直连搜索状态
  const [directResults, setDirectResults] = useState<VideoItem[]>([])
  const [directLoading, setDirectLoading] = useState(false)
  const [searchProgress, setSearchProgress] = useState({ completed: 0, total: 0 })
  const abortCtrlRef = useRef<AbortController | null>(null)
  const timeOutTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Hooks
  const { searchHistory, removeSearchHistoryItem } = useSearchHistory()
  const { suggestions, isLoading: suggestionsLoading, fetchSuggestions, clearSuggestions } = useSearchSuggestions()
  const { videoAPIs } = useApiStore()
  const { getCachedResults, updateCachedResults } = useSearchStore()
  const cmsClient = useCmsClient()

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

  // Trending Hook（热搜数据）
  const { trending, refreshTrending } = useTmdbNowPlaying()

  // 获取国家列表
  const countries = useTmdbStore(s => s.availableFilterOptions.countries)
  const years = useTmdbStore(s => s.availableFilterOptions.years)
  const fetchGenresAndCountries = useTmdbStore(s => s.fetchGenresAndCountries)

  // 初始化时获取分类和国家列表以及热搜数据
  useEffect(() => {
    fetchGenresAndCountries()
    refreshTrending()
  }, [fetchGenresAndCountries, refreshTrending])

  // 无搜索词时加载 discover 数据（TMDB 模式）
  useEffect(() => {
    if (!query && mode === 'tmdb') {
      fetchDiscover(discoverPage)
    }
  }, [query, mode, discoverPage, fetchDiscover])

  // 筛选条件变化时重新加载 discover 数据
  useEffect(() => {
    if (!query && mode === 'tmdb') {
      setDiscoverPage(1)
      fetchDiscover(1)
    }
  }, [filterOptions, query, mode, fetchDiscover])

  // 筛选启用的视频源
  const selectedAPIs = useMemo(() => {
    return videoAPIs.filter(api => api.isEnabled)
  }, [videoAPIs])

  // 计算直连搜索分页
  const directTotalPages = useMemo(() => {
    return Math.ceil(directResults.length / PAGE_SIZE)
  }, [directResults.length])

  // 计算 TMDB 分页（使用筛选后的结果）
  const tmdbPaginatedResults = useMemo(() => {
    const start = (tmdbPage - 1) * PAGE_SIZE
    return tmdbFilteredResults.slice(start, start + PAGE_SIZE)
  }, [tmdbFilteredResults, tmdbPage])

  const tmdbTotalPages = useMemo(() => {
    return Math.ceil(tmdbFilteredResults.length / PAGE_SIZE)
  }, [tmdbFilteredResults.length])

  // 动态更新页面标题
  useDocumentTitle(query ? `${query} - 搜索` : '搜索中心')

  // 下拉框显示条件
  const hasContent = inputValue.trim().length > 0
  const hasHistory = searchHistory.length > 0
  const hasSuggestions = suggestions.length > 0
  const shouldShowDropdown = isDropdownOpen && (hasContent ? hasSuggestions || suggestionsLoading : hasHistory)

  // 处理模式切换
  const handleModeChange = useCallback((newMode: SearchMode) => {
    setMode(newMode)
    setSearchParams(prev => {
      const params = new URLSearchParams(prev)
      params.set('mode', newMode)
      return params
    })
  }, [setSearchParams])

  // 处理搜索
  const handleSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return

    setInputValue(searchQuery)
    setIsDropdownOpen(false)
    clearSuggestions()

    // 更新 URL
    setSearchParams(prev => {
      const params = new URLSearchParams(prev)
      params.set('q', searchQuery)
      params.set('mode', mode)
      return params
    })

    // 重置分页
    setTmdbPage(1)
    setDirectPage(1)
  }, [mode, setSearchParams, clearSuggestions])

  // 直连搜索逻辑
  const fetchDirectSearch = useCallback(async (keyword: string) => {
    if (!keyword || selectedAPIs.length === 0) return

    abortCtrlRef.current?.abort()
    const controller = new AbortController()
    abortCtrlRef.current = controller

    setDirectLoading(true)
    setSearchProgress({ completed: 0, total: selectedAPIs.length })

    if (timeOutTimer.current) {
      clearTimeout(timeOutTimer.current)
      timeOutTimer.current = null
    }
    timeOutTimer.current = setTimeout(() => {
      setDirectLoading(false)
      timeOutTimer.current = null
    }, PaginationConfig.maxRequestTimeout)

    // 检查缓存
    const cached = getCachedResults(keyword)
    if (cached?.isComplete) {
      setDirectResults(cached.results)
      setDirectLoading(false)
      if (timeOutTimer.current) {
        clearTimeout(timeOutTimer.current)
        timeOutTimer.current = null
      }
      return
    }

    if (cached) {
      setDirectResults(cached.results)
    } else {
      setDirectResults([])
    }

    let completedCount = cached?.completedApiIds.length || 0
    const completedApiIds = cached?.completedApiIds ? [...cached.completedApiIds] : []
    const apisToSearch = cached
      ? selectedAPIs.filter(api => !cached.completedApiIds.includes(api.id))
      : selectedAPIs

    if (apisToSearch.length === 0) {
      setDirectLoading(false)
      if (timeOutTimer.current) {
        clearTimeout(timeOutTimer.current)
        timeOutTimer.current = null
      }
      return
    }

    let hasNewResults = false

    // 订阅增量结果事件
    const unsubResult = cmsClient.on('search:result', (event: SearchResultEvent) => {
      hasNewResults = true
      setDirectResults(prev => {
        const mergedRes = [...prev, ...event.items]
        if (mergedRes.length >= PAGE_SIZE) setDirectLoading(false)
        return mergedRes
      })

      const newApiIds = Array.from(
        new Set(
          event.items
            .map((r: VideoItem) => r.source_code)
            .filter((id: string | undefined): id is string => !!id),
        ),
      )
      newApiIds.forEach(id => {
        if (!completedApiIds.includes(id)) {
          completedApiIds.push(id)
          completedCount++
          setSearchProgress(prev => ({ ...prev, completed: completedCount }))
        }
      })

      updateCachedResults(keyword, event.items, completedApiIds, false)
    })

    const searchPromise = cmsClient
      .aggregatedSearch(keyword, apisToSearch, controller.signal)
      .then((allResults: VideoItem[]) => {
        const allApiIds = apisToSearch.map(api => api.id)
        const finalApiIds = Array.from(new Set([...completedApiIds, ...allApiIds]))

        const selectedApiIds = selectedAPIs.map(api => api.id)
        const isComplete = selectedApiIds.every(id => finalApiIds.includes(id))

        updateCachedResults(keyword, hasNewResults ? [] : allResults, finalApiIds, isComplete)

        const totalCount = directResults.length + allResults.length
        toast.success(`搜索完成！${isComplete ? '总计' : '当前'} ${totalCount} 条结果`)
      })
      .catch(error => {
        if ((error as Error).name !== 'AbortError') {
          console.error('直连搜索失败:', error)
        }
      })
      .finally(() => {
        unsubResult()
        setDirectLoading(false)
        if (timeOutTimer.current) {
          clearTimeout(timeOutTimer.current)
          timeOutTimer.current = null
        }
      })

    toast.promise(searchPromise, {
      loading: '持续搜索内容中......',
    })
  }, [selectedAPIs, getCachedResults, updateCachedResults, cmsClient, directResults.length])

  // 监听搜索词和模式变化
  useEffect(() => {
    if (!query) return

    setInputValue(query)

    if (mode === 'tmdb') {
      tmdbSearch(query)
    } else {
      fetchDirectSearch(query)
    }

    return () => {
      abortCtrlRef.current?.abort()
    }
  }, [query, mode, tmdbSearch, fetchDirectSearch])

  // 同步 URL 中的模式参数
  useEffect(() => {
    if (modeParam && modeParam !== mode) {
      setMode(modeParam)
    }
  }, [modeParam, mode])

  // 输入变化处理
  const handleInputChange = (value: string) => {
    setInputValue(value)
    if (value.trim()) {
      fetchSuggestions(value)
    } else {
      clearSuggestions()
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch(inputValue)
    }
    if (event.key === 'Escape') {
      setIsDropdownOpen(false)
    }
  }

  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
    }
    setIsDropdownOpen(true)
  }

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false)
    }, 200)
  }

  const handleClear = () => {
    setInputValue('')
    clearSuggestions()
    inputRef.current?.focus()
  }

  const handleHistoryClick = (content: string) => {
    handleSearch(content)
  }

  const handleSuggestionClick = (title: string) => {
    handleSearch(title)
  }

  // 清理定时器
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
      if (timeOutTimer.current) {
        clearTimeout(timeOutTimer.current)
      }
    }
  }, [])

  return (
    <motion.div
      className="flex flex-col gap-6 p-4 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 搜索区域 - 使用 motion 动画实现平滑的位置过渡 */}
      <motion.section
        variants={itemVariants}
        className="flex flex-col items-center gap-4"
        animate={{
          paddingTop: mode === 'direct' && !query ? 96 : 0,
        }}
        transition={{
          duration: 0.4,
          // 切换到直连模式时延迟（等待下方内容消失），切换回智能检索时立即开始
          delay: mode === 'direct' && !query ? 0.35 : 0,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        {/* 模式切换 - 在搜索框上方居中 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <SearchModeToggle mode={mode} onChange={handleModeChange} />
        </motion.div>

        {/* 搜索框 - 居中显示 */}
        <motion.div
          className="w-full max-w-3xl px-4 sm:px-0"
          layoutId="main-search-box"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
            <Popover open={shouldShowDropdown}>
              <PopoverAnchor asChild>
                <div className="relative flex w-full">
                  <Search
                    className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                    size={18}
                  />
                  <Input
                    ref={inputRef}
                    placeholder="搜索电影、剧集..."
                    className="h-11 rounded-full rounded-r-none pr-8 pl-10 text-base focus-visible:ring-1"
                    value={inputValue}
                    onChange={e => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {inputValue.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-24 -translate-y-1/2 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <Button
                    disabled={inputValue.length === 0}
                    className="dark:bg-accent dark:hover:bg-accent/80 h-11 w-20 rounded-full rounded-l-none bg-gray-200 hover:bg-gray-300"
                    onClick={() => handleSearch(inputValue)}
                  >
                    <Search className="text-primary" size={20} />
                  </Button>
                </div>
              </PopoverAnchor>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0"
                align="start"
                sideOffset={8}
                onOpenAutoFocus={e => e.preventDefault()}
              >
                <div className="p-1">
                  <ScrollArea className="max-h-80 px-3">
                    {!hasContent ? (
                      // 最近搜索
                      <div>
                        <div className="text-muted-foreground px-3 py-2 text-xs font-medium">最近搜索</div>
                        {searchHistory.map(item => (
                          <div
                            key={item.id}
                            className="hover:bg-accent group flex cursor-pointer items-center rounded-lg px-3 py-2 transition-colors"
                            onClick={() => handleHistoryClick(item.content)}
                          >
                            <History className="text-muted-foreground mr-3 size-4 shrink-0" />
                            <span className="flex-1 truncate">{item.content}</span>
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-destructive shrink-0 p-1 opacity-0 transition-colors group-hover:opacity-100"
                              onMouseDown={e => e.preventDefault()}
                              onClick={e => {
                                e.stopPropagation()
                                removeSearchHistoryItem(item.id)
                              }}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // 搜索建议
                      <div>
                        {suggestionsLoading ? (
                          <div className="text-muted-foreground px-3 py-4 text-center text-sm">搜索中...</div>
                        ) : (
                          suggestions.map(item => (
                            <div
                              key={`${item.mediaType}-${item.id}`}
                              className="hover:bg-accent flex cursor-pointer items-center rounded-lg px-3 py-2 transition-colors"
                              onClick={() => handleSuggestionClick(item.title)}
                            >
                              <Search className="text-muted-foreground mr-3 size-4 shrink-0" />
                              <span className="flex-1 truncate">{item.title}</span>
                              <span className="text-muted-foreground ml-2 shrink-0 text-xs">
                                {item.mediaType === 'movie' ? '电影' : '剧集'}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
          </motion.div>

        {/* 大家都在搜 - 直连模式无搜索词时显示 */}
        <AnimatePresence>
          {mode === 'direct' && !query && trending.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.25, delay: 0 } }}
              transition={{
                delay: 0.5, // 切换到直连模式时，等待搜索区域开始移动后再出现
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="w-full max-w-3xl px-4 sm:px-0"
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="text-primary size-4" />
                <span className="text-muted-foreground text-sm font-medium">大家都在搜</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {trending.slice(0, 12).map((item) => (
                  <button
                    key={`${item.mediaType}-${item.id}`}
                    type="button"
                    onClick={() => handleSearch(item.title)}
                    className="bg-muted hover:bg-muted/80 hover:text-primary rounded-full px-3 py-1.5 text-sm transition-colors"
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* 分类筛选和结果区域 - 使用 AnimatePresence 实现平滑过渡 */}
      <AnimatePresence mode="wait">
        {mode === 'tmdb' && (
          <motion.div
            key="tmdb-content"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: 20,
              transition: {
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
              },
            }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94],
              // 切换到智能检索时延迟出现，等待搜索区域上移和"大家都在搜"消失
              delay: 0.4,
            }}
            className="flex flex-col gap-6"
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
                  mode={mode}
                  tmdbResults={tmdbPaginatedResults}
                  directResults={directResults}
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
        )}

        {mode === 'direct' && query && (
          <motion.div
            key="direct-content"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: 20,
              transition: {
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
              },
            }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
