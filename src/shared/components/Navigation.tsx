import { Navbar, NavbarBrand, NavbarContent } from '@/shared/components/ui/navbar'
import { OkiLogo } from '@/shared/components/icons'
import { SidebarTrigger } from '@/shared/components/ui/sidebar'
import { NavLink } from 'react-router'
import { useSearch } from '@/shared/hooks'
import { useEffect, useState, useRef } from 'react'
import { Moon, Sun, Search, Laptop, X, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { ThemeToggle, useThemeState } from './theme'

// 创建支持 motion 的 Button 组件
const MotionButton = motion.create(Button)

export default function Navigation() {
  const { search: searchQuery, searchMovie } = useSearch()
  const { mode } = useThemeState()

  const [inputContent, setInputContent] = useState('')
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const mobileInputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      searchMovie(inputContent)
    }
  }
  const handleClear = () => {
    setInputContent('')
  }

  const openMobileSearch = () => {
    setIsMobileSearchOpen(true)
    // 等待动画开始后聚焦输入框
    setTimeout(() => {
      mobileInputRef.current?.focus()
    }, 100)
  }

  const closeMobileSearch = () => {
    setIsMobileSearchOpen(false)
  }

  useEffect(() => {
    setInputContent(searchQuery)
  }, [searchQuery])

  return (
    <div className="sticky top-0 z-50 flex w-full justify-center">
      <Navbar>
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

        {/* Logo 和侧边栏触发器 - 移动端搜索模式下隐藏 */}
        <NavbarBrand
          className={`!flex-none transition-all duration-300 ease-out ${
            isMobileSearchOpen
              ? 'pointer-events-none -translate-x-4 opacity-0 sm:pointer-events-auto sm:translate-x-0 sm:opacity-100'
              : ''
          }`}
        >
          <SidebarTrigger />
          <NavLink to="/" className="flex items-center">
            <div className="flex items-end">
              <div>
                <OkiLogo />
              </div>
              <p className="text-accent-foreground text-lg font-bold">OUONNKI TV</p>
            </div>
          </NavLink>
        </NavbarBrand>

        <NavbarContent justify="center" className="gap-2">
          <div className="flex-1" />
          <div className="flex flex-auto items-center">
            {/* 桌面端搜索框 */}
            <div className="relative hidden w-full sm:flex">
              <Search
                className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                size={18}
              />
              <Input
                placeholder="搜索"
                className="h-9 rounded-full rounded-r-none pr-8 pl-10 overflow-ellipsis focus-visible:ring-1"
                value={inputContent}
                onChange={e => setInputContent(e.target.value)}
                onKeyDown={handleKeyDown}
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
                onClick={() => searchMovie(inputContent)}
              >
                <Search className="text-primary" size={20} />
              </Button>
            </div>

            {/* 移动端展开的搜索框 */}
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
                  onChange={e => setInputContent(e.target.value)}
                  onKeyDown={handleKeyDown}
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
                  onClick={() => searchMovie(inputContent)}
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
          </div>

          <div
            className={`flex flex-1 justify-end gap-2 transition-all duration-300 ease-out sm:gap-0 ${
              isMobileSearchOpen
                ? 'pointer-events-none translate-x-4 opacity-0 sm:pointer-events-auto sm:translate-x-0 sm:opacity-100'
                : ''
            }`}
          >
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
            <ThemeToggle>
              <Button size="icon" variant="ghost" className="size-7">
                {mode === 'dark' && <Moon />}
                {mode === 'light' && <Sun />}
                {mode === 'system' && <Laptop />}
              </Button>
            </ThemeToggle>
          </div>
        </NavbarContent>
      </Navbar>
    </div>
  )
}
