import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X, History, Trash2 } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Popover, PopoverContent, PopoverAnchor } from '@/shared/components/ui/popover'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { useSearchHistory, useSearchSuggestions } from '@/shared/hooks'

interface SearchHubInputProps {
  /** Initial query from URL */
  initialQuery: string
  /** Callback when search is triggered */
  onSearch: (query: string) => void
  /** Callback when clear button is clicked */
  onClear?: () => void
  /** 禁用搜索历史下拉（由外部渲染历史） */
  hideHistoryDropdown?: boolean
  className?: string
}

export function SearchHubInput({
  initialQuery,
  onSearch,
  onClear,
  hideHistoryDropdown = false,
  className,
}: SearchHubInputProps) {
  const [inputValue, setInputValue] = useState(initialQuery)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { searchHistory, removeSearchHistoryItem } = useSearchHistory()
  const {
    suggestions,
    isLoading: suggestionsLoading,
    fetchSuggestions,
    clearSuggestions,
  } = useSearchSuggestions()

  // Sync with initialQuery prop (e.g. when URL changes)
  useEffect(() => {
    setInputValue(initialQuery)
  }, [initialQuery])

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  // Derived state for dropdown
  const hasContent = inputValue.trim().length > 0
  const hasHistory = searchHistory.length > 0
  const hasSuggestions = suggestions.length > 0
  const shouldShowDropdown =
    isDropdownOpen && (hasContent ? hasSuggestions || suggestionsLoading : hasHistory && !hideHistoryDropdown)

  const handleInteractiveItemKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    action: () => void,
  ) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    action()
  }

  const handleSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return

      setInputValue(searchQuery)
      setIsDropdownOpen(false)
      clearSuggestions()
      onSearch(searchQuery)
    },
    [clearSuggestions, onSearch],
  )

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
      inputRef.current?.blur()
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
    onClear?.()
    inputRef.current?.focus()
  }

  return (
    <div className={`w-full max-w-3xl ${className}`}>
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
                // History
                <div>
                  <div className="text-muted-foreground px-3 py-2 text-xs font-medium">
                    最近搜索
                  </div>
                  {searchHistory.map(item => (
                    <div
                      key={item.id}
                      className="hover:bg-accent group flex cursor-pointer items-center rounded-lg px-3 py-2 transition-colors"
                      onClick={() => handleSearch(item.content)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => handleInteractiveItemKeyDown(e, () => handleSearch(item.content))}
                    >
                      <History className="text-muted-foreground mr-3 size-4 shrink-0" />
                      <span className="flex-1 truncate">{item.content}</span>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-destructive shrink-0 p-1 opacity-0 transition-colors group-hover:opacity-100"
                        onMouseDown={e => e.preventDefault()}
                        onKeyDown={e => e.stopPropagation()}
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
                // Suggestions
                <div>
                  {suggestionsLoading ? (
                    <div className="text-muted-foreground px-3 py-4 text-center text-sm">
                      搜索中...
                    </div>
                  ) : (
                    suggestions.map(item => (
                      <div
                        key={`${item.mediaType}-${item.id}`}
                        className="hover:bg-accent flex cursor-pointer items-center rounded-lg px-3 py-2 transition-colors"
                        onClick={() => handleSearch(item.title)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => handleInteractiveItemKeyDown(e, () => handleSearch(item.title))}
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
    </div>
  )
}
