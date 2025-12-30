import { OkiLogo, SearchIcon, SettingIcon, CloseIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchHistory, useSearch } from '@/hooks'

import { useSettingStore } from '@/store/settingStore'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import RecentHistory from '@/components/RecentHistory'
import { isBrowser } from 'react-device-detect'
import { useNavigate } from 'react-router'

import { useVersionStore } from '@/store/versionStore'
const UpdateModal = React.lazy(() => import('@/components/UpdateModal'))

function App() {
  // 路由控制
  const navigate = useNavigate()
  // 删除控制
  const [isSearchHistoryDeleteOpen, setIsSearchHistoryDeleteOpen] = useState(false)

  const { searchHistory, removeSearchHistoryItem, clearSearchHistory } = useSearchHistory()
  const { search, setSearch, searchMovie } = useSearch()

  const { hasNewVersion, setShowUpdateModal } = useVersionStore()
  const { system } = useSettingStore()

  const [buttonTransitionStatus, setButtonTransitionStatus] = useState({
    opacity: 0,
    filter: 'blur(5px)',
  })
  const [buttonIsDisabled, setButtonIsDisabled] = useState(true)
  const [hoveredChipId, setHoveredChipId] = useState<string | null>(null)

  useEffect(() => {
    if (search.length > 0) {
      setButtonTransitionStatus({
        opacity: 1,
        filter: 'blur(0px)',
      })
      setButtonIsDisabled(false)
    } else {
      setButtonIsDisabled(true)
      setButtonTransitionStatus({
        opacity: 0,
        filter: 'blur(5px)',
      })
    }
  }, [search])

  // 检查版本更新
  useEffect(() => {
    // 检查更新
    if (hasNewVersion() && system.isUpdateLogEnabled) {
      setShowUpdateModal(true)
    }
  }, [hasNewVersion, setShowUpdateModal, system.isUpdateLogEnabled])

  const handleSearch = () => {
    searchMovie(search)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <>
      <React.Suspense fallback={null}>
        <UpdateModal />
      </React.Suspense>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div layoutId="history-icon" className="absolute top-5 right-5 z-50 flex gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/20 shadow-lg shadow-gray-500/10 backdrop-blur-2xl dark:bg-black/20"
          >
            <RecentHistory />
          </Button>
          <Button
            onClick={() => {
              navigate('/settings')
            }}
            variant="ghost"
            size="icon"
            className="bg-white/20 shadow-lg shadow-gray-500/10 backdrop-blur-2xl dark:bg-black/20"
          >
            <SettingIcon size={25} />
          </Button>
        </motion.div>
        <div className="flex h-full min-h-screen w-full flex-col items-center justify-start md:min-h-0 md:justify-center">
          <motion.div
            layoutId="app-logo"
            transition={{ duration: 0.4 }}
            className="mt-[7rem] flex translate-x-[-1rem] items-end gap-2 text-[1.5rem] md:mt-[10rem] md:text-[2rem]"
          >
            <motion.div layoutId="logo-icon">
              <div className="block md:hidden">
                <OkiLogo size={48} />
              </div>
              <div className="hidden md:block">
                <OkiLogo size={64} />
              </div>
            </motion.div>
            <motion.p layoutId="logo-text" className="font-bold text-inherit">
              OUONNKI TV
            </motion.p>
          </motion.div>
          <motion.div
            layoutId="search-container"
            initial={{ width: 'min(30rem, 90vw)' }}
            whileHover={{
              scale: 1.03,
              width: 'min(30rem, 90vw)',
            }}
            className="mt-[1rem] h-fit px-4 md:px-0"
          >
            <div className="relative flex h-13 w-full items-center rounded-full border border-border bg-background px-4 shadow-lg">
              <motion.div layoutId="search-icon" className="mr-3">
                <SearchIcon size={18} />
              </motion.div>
              <Input
                className="h-full flex-1 border-0 bg-transparent text-md shadow-none focus-visible:ring-0"
                placeholder="输入内容搜索..."
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <motion.div
                initial={{ opacity: 0, filter: 'blur(5px)' }}
                animate={{
                  opacity: buttonTransitionStatus.opacity,
                  filter: buttonTransitionStatus.filter,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  className="bg-gradient-to-br from-gray-500 to-gray-950 font-bold text-white shadow-lg"
                  size="sm"
                  onClick={handleSearch}
                  disabled={buttonIsDisabled}
                >
                  搜索
                </Button>
              </motion.div>
            </div>
          </motion.div>
          {useSettingStore.getState().search.isSearchHistoryVisible && searchHistory.length > 0 && (
            <motion.div
              initial={{ filter: isBrowser ? 'opacity(20%)' : 'opacity(100%)' }}
              whileHover={{
                filter: 'opacity(100%)',
              }}
              transition={{ duration: 0.4 }}
              className="mt-[3rem] flex w-[88vw] flex-col items-start gap-2 px-4 md:w-[42rem] md:flex-row md:px-0"
            >
              <p className="text-lg font-bold">搜索历史：</p>
              <div className="flex flex-col">
                <div className="flex w-full flex-wrap gap-3 md:w-[34rem]">
                  <AnimatePresence mode="popLayout">
                    {searchHistory.map(item => (
                      <motion.div
                        key={item.id}
                        layout
                        exit={{ opacity: 0, filter: 'blur(5px)' }}
                        onMouseEnter={() => setHoveredChipId(item.id)}
                        onMouseLeave={() => setHoveredChipId(null)}
                        className="group relative"
                      >
                        <Badge
                          variant="outline"
                          className="cursor-pointer border-2 border-gray-400 px-3 py-1 text-sm transition-all duration-300 hover:scale-101 hover:border-black"
                          onClick={() => searchMovie(item.content)}
                        >
                          {item.content}
                          <span
                            className={`ml-2 cursor-pointer text-gray-400 transition-opacity duration-200 hover:text-gray-600 ${hoveredChipId === item.id ? 'opacity-100' : 'opacity-0'}`}
                            onClick={e => {
                              e.stopPropagation()
                              if (hoveredChipId === item.id) {
                                removeSearchHistoryItem(item.id)
                              }
                            }}
                          >
                            ×
                          </span>
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="flex justify-end">
                  <div className="w-fit">
                    <Popover
                      open={isSearchHistoryDeleteOpen}
                      onOpenChange={setIsSearchHistoryDeleteOpen}
                    >
                      <PopoverTrigger asChild>
                        <motion.div
                          initial={{ color: '#cccccc' }}
                          whileHover={{ color: '#999999' }}
                          transition={{ duration: 0.4 }}
                          className="flex justify-end gap-2 pt-[1.5rem] pr-[1.8rem] hover:cursor-pointer"
                        >
                          <CloseIcon size={20} />
                          <p className="text-sm">清除全部</p>
                        </motion.div>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto bg-white/20 shadow-lg shadow-gray-500/10 backdrop-blur-xl"
                        side={isBrowser ? 'top' : 'bottom'}
                        align="end"
                      >
                        <div className="px-1 py-2">
                          <p>确定要清除全部搜索记录吗？</p>
                          <div className="mt-[.6rem] flex justify-end gap-[.5rem]">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-[1.5rem] text-[.7rem] font-bold"
                              onClick={() => setIsSearchHistoryDeleteOpen(false)}
                            >
                              取消
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-[1.5rem] text-[.7rem] font-bold"
                              onClick={() => {
                                clearSearchHistory()
                                setIsSearchHistoryDeleteOpen(false)
                              }}
                            >
                              确定
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        {import.meta.env.VITE_DISABLE_ANALYTICS !== 'true' && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </motion.div>
    </>
  )
}

export default App
