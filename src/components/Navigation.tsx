import { Navbar, NavbarBrand, NavbarContent } from '@/components/ui/navbar'
import { OkiLogo, SearchIcon } from '@/components/icons'
import { NavLink } from 'react-router'
import { useSearch } from '@/hooks'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import RecentHistory from '@/components/RecentHistory'

import { useSearchStore } from '@/store/searchStore'
import { useSettingStore } from '@/store/settingStore'
import { TrashIcon } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function Navigation() {
  const { search: searchQuery, searchMovie } = useSearch()
  const { searchHistory, removeSearchHistoryItem, clearSearchHistory } = useSearchStore()
  const { search: searchSettings } = useSettingStore()

  const [isFocused, setIsFocused] = useState(false)
  // Delay blur to allow item click
  const handleBlur = () => {
    setTimeout(() => setIsFocused(false), 200)
  }
  const [inputContent, setInputContent] = useState('')
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      searchMovie(inputContent)
    }
  }
  useEffect(() => {
    setInputContent(searchQuery)
  }, [searchQuery])
  return (
    <motion.div
      className="sticky top-0 z-50 flex justify-center"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: 'tween',
        duration: 0.5,
        ease: 'easeOut',
      }}
    >
      <Navbar className="max-w-[75rem] p-2">
        <NavbarBrand className="!flex-none">
          <NavLink to="/" className="flex items-center gap-2">
            <motion.div layoutId="app-logo" className="flex items-end gap-2">
              <motion.div layoutId="logo-icon">
                <OkiLogo />
              </motion.div>
              <motion.p
                layoutId="logo-text"
                className="hidden text-lg font-bold text-inherit md:block"
              >
                OUONNKI TV
              </motion.p>
            </motion.div>
          </NavLink>
        </NavbarBrand>
        <NavbarContent justify="end" className="items-center">
          <motion.div layoutId="search-container" className="relative flex w-full justify-end">
            <div className="relative flex h-10 w-full max-w-[15rem] items-center rounded-full bg-muted/40 px-3 transition-all duration-300 hover:max-w-[24rem] dark:bg-muted/20">
              <motion.div layoutId="search-icon" className="mr-2">
                <SearchIcon size={18} />
              </motion.div>
              <Input
                className="h-full flex-1 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
                placeholder="输入内容搜索..."
                type="search"
                value={inputContent}
                onChange={e => setInputContent(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
              />
            </div>
            {isFocused && searchSettings.isSearchHistoryVisible && searchHistory.length > 0 && (
              <div className="absolute top-12 left-0 w-full px-2">
                <Card className="w-full bg-white/80 p-2 shadow-xl backdrop-blur-md dark:bg-black/80">
                  <div className="mb-2 flex items-center justify-between px-2 text-xs text-gray-500">
                    <span>搜索历史</span>
                    <span
                      className="cursor-pointer hover:text-red-500"
                      onClick={clearSearchHistory}
                    >
                      清空
                    </span>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {searchHistory.map(item => (
                      <div
                        key={item.id}
                        className="flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => {
                          setInputContent(item.content)
                          searchMovie(item.content)
                          setIsFocused(false)
                        }}
                      >
                        <span className="line-clamp-1 text-sm">{item.content}</span>
                        <div
                          className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                          onClick={e => {
                            e.stopPropagation()
                            removeSearchHistoryItem(item.id)
                          }}
                        >
                          <TrashIcon size={12} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </motion.div>
          <motion.div
            layoutId="history-icon"
            className="flex items-center rounded-full p-2 transition-all duration-300 hover:cursor-pointer hover:bg-gray-200 active:bg-gray-200"
          >
            <RecentHistory />
          </motion.div>
        </NavbarContent>
      </Navbar>
    </motion.div>
  )
}
