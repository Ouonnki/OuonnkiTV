import { useEffect, useState, useRef, useCallback } from 'react'
import { Search, X, ArrowLeft, History, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Popover, PopoverContent, PopoverAnchor } from '@/shared/components/ui/popover'
import { useSearch, useSearchHistory, useSearchSuggestions } from '@/shared/hooks'
import { ScrollArea } from '@/shared/components/ui/scroll-area'

// 创建支持 motion 的 Button 组件
const MotionButton = motion.create(Button)

interface SearchBoxProps {
  /** 移动端搜索框展开状态变化回调，用于父组件调整布局 */
  onMobileSearchChange?: (isOpen: boolean) => void
}

export default function SearchBox({ onMobileSearchChange }: SearchBoxProps) {
  const { search: searchQuery, searchMovie } = useSearch()
  const { searchHistory, removeSearchHistoryItem } = useSearchHistory()
  const { suggestions, isLoading, fetchSuggestions, clearSuggestions } = useSearchSuggestions()

  const [inputContent, setInputContent] = useState('')
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const mobileInputRef = useRef<HTMLInputElement>(null)
  const desktopInputRef = useRef<HTMLInputElement>(null)
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 判断是否应该显示下拉框
  const hasContent = inputContent.trim().length > 0
  const hasHistory = searchHistory.length > 0
  const hasSuggestions = suggestions.length > 0
  const shouldShowDropdown =
    isDropdownOpen && (hasContent ? hasSuggestions || isLoading : hasHistory)

  const handleInteractiveItemKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    action: () => void,
  ) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    action()
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      searchMovie(inputContent)
      setIsDropdownOpen(false)
    }
    if (event.key === 'Escape') {
      setIsDropdownOpen(false)
    }
  }

  const handleClear = () => {
    setInputContent('')
    clearSuggestions()
  }

  const handleInputChange = (value: string) => {
    setInputContent(value)
    if (value.trim()) {
      fetchSuggestions(value)
    } else {
      clearSuggestions()
    }
  }

  const handleFocus = () => {
    // 清除之前的 blur 超时
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
    }
    setIsDropdownOpen(true)
  }

  const handleBlur = () => {
    // 延迟关闭以允许点击下拉项
    blurTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false)
    }, 200)
  }

  const handleHistoryItemClick = useCallback(
    (content: string) => {
      setInputContent(content)
      searchMovie(content)
      setIsDropdownOpen(false)
    },
    [searchMovie],
  )

  const handleHistoryItemDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation()
      removeSearchHistoryItem(id)
    },
    [removeSearchHistoryItem],
  )

  const handleSuggestionClick = useCallback(
    (title: string) => {
      setInputContent(title)
      searchMovie(title)
      setIsDropdownOpen(false)
    },
    [searchMovie],
  )

  const openMobileSearch = () => {
    setIsMobileSearchOpen(true)
    onMobileSearchChange?.(true)
    // 等待动画开始后聚焦输入框
    setTimeout(() => {
      mobileInputRef.current?.focus()
    }, 100)
  }

  const closeMobileSearch = () => {
    setIsMobileSearchOpen(false)
    setIsDropdownOpen(false)
    onMobileSearchChange?.(false)
  }

  useEffect(() => {
    setInputContent(searchQuery)
  }, [searchQuery])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  // 下拉框内容组件
  const DropdownContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="p-1">
      <ScrollArea className="max-h-100 px-3">
        {!hasContent ? (
          // 最近搜索
          <div>
            <div className="text-muted-foreground px-3 py-2 text-xs font-medium">最近搜索</div>
            {searchHistory.map(item => (
              <div
                key={item.id}
                className="hover:bg-accent group flex cursor-pointer items-center rounded-lg px-3 py-2 transition-colors"
                onClick={() => handleHistoryItemClick(item.content)}
                role="button"
                tabIndex={0}
                onKeyDown={e => handleInteractiveItemKeyDown(e, () => handleHistoryItemClick(item.content))}
              >
                <History className="text-muted-foreground mr-3 size-4 shrink-0" />
                <span className="flex-1 truncate">{item.content}</span>
                <button
                  type="button"
                  className={`text-muted-foreground hover:text-destructive shrink-0 p-1 transition-colors ${
                    isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  onMouseDown={e => e.preventDefault()}
                  onKeyDown={e => e.stopPropagation()}
                  onClick={e => handleHistoryItemDelete(e, item.id)}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          // 搜索建议
          <div>
            {isLoading ? (
              <div className="text-muted-foreground px-3 py-4 text-center text-sm">搜索中...</div>
            ) : (
              suggestions.map(item => (
                <div
                  key={`${item.mediaType}-${item.id}`}
                  className="hover:bg-accent flex cursor-pointer items-center rounded-lg px-3 py-2 transition-colors"
                  onClick={() => handleSuggestionClick(item.title)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => handleInteractiveItemKeyDown(e, () => handleSuggestionClick(item.title))}
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
  )

  return (
    <>
      {/* 移动端搜索模式下的返回按钮 */}
      <div
        className={`absolute left-2 transition-all duration-300 ease-out sm:hidden ${
          isMobileSearchOpen
            ? 'translate-x-0 opacity-100'
            : 'pointer-events-none -translate-x-4 opacity-0'
        }`}
      >
        <Button size="icon" variant="ghost" className="size-9" onClick={closeMobileSearch}>
          <ArrowLeft className="text-primary" size={20} />
        </Button>
      </div>

      {/* 搜索框容器 */}
      <div className="flex flex-auto items-center">
        {/* 桌面端搜索框 */}
        <Popover open={shouldShowDropdown && !isMobileSearchOpen}>
          <PopoverAnchor asChild>
            <div className="relative hidden w-full sm:flex">
              <Search
                className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                size={18}
              />
              <Input
                ref={desktopInputRef}
                placeholder="搜索"
                className="h-9 rounded-full rounded-r-none pr-8 pl-10 overflow-ellipsis focus-visible:ring-1"
                value={inputContent}
                onChange={e => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              {inputContent.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-[88px] -translate-y-1/2 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
              <Button
                disabled={inputContent.length === 0}
                className="dark:bg-accent dark:hover:bg-accent h-9 w-20 rounded-full rounded-l-none bg-gray-200 hover:bg-gray-300"
                onClick={() => {
                  searchMovie(inputContent)
                  setIsDropdownOpen(false)
                }}
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
            <DropdownContent />
          </PopoverContent>
        </Popover>

        {/* 移动端展开的搜索框 */}
        <Popover open={shouldShowDropdown && isMobileSearchOpen}>
          <PopoverAnchor asChild>
            <div
              className={`absolute right-4 left-12 transition-all duration-300 ease-out sm:hidden ${
                isMobileSearchOpen
                  ? 'scale-100 opacity-100'
                  : 'pointer-events-none scale-95 opacity-0'
              }`}
            >
              <div className="relative flex w-full">
                <Search
                  className="text-muted-foreground absolute top-1/2 left-3 z-10 -translate-y-1/2"
                  size={18}
                />
                <Input
                  ref={mobileInputRef}
                  placeholder="搜索"
                  className="h-9 rounded-full rounded-r-none pr-8 pl-10 overflow-ellipsis focus-visible:ring-1"
                  value={inputContent}
                  onChange={e => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                {inputContent.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-[56px] z-10 -translate-y-1/2 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
                <MotionButton
                  disabled={inputContent.length === 0}
                  className="dark:bg-accent dark:hover:bg-accent h-9 w-12 rounded-full rounded-l-none bg-gray-200 hover:bg-gray-300"
                  onClick={() => {
                    searchMovie(inputContent)
                    setIsDropdownOpen(false)
                  }}
                  layout
                >
                  {isMobileSearchOpen && (
                    <motion.span layoutId="mobile-search-icon">
                      <Search className="text-primary" size={18} />
                    </motion.span>
                  )}
                </MotionButton>
              </div>
            </div>
          </PopoverAnchor>
          <PopoverContent
            className="w-[calc(100vw-64px)] p-0"
            align="start"
            sideOffset={8}
            onOpenAutoFocus={e => e.preventDefault()}
          >
            <DropdownContent isMobile />
          </PopoverContent>
        </Popover>
      </div>

      {/* 移动端搜索触发按钮 */}
      <MotionButton
        size="icon"
        variant="ghost"
        className="size-7 sm:hidden"
        onClick={openMobileSearch}
        layout
      >
        {!isMobileSearchOpen && (
          <motion.span layoutId="mobile-search-icon">
            <Search className="text-primary" size={20} />
          </motion.span>
        )}
      </MotionButton>

      {/* 用于传递移动端搜索状态给父组件的隐藏元素 */}
      <input type="hidden" data-mobile-search-open={isMobileSearchOpen} />
    </>
  )
}

export { SearchBox }
export type { SearchBoxProps }
