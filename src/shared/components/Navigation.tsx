import { Navbar, NavbarBrand, NavbarContent } from '@/shared/components/ui/navbar'
import { OkiLogo } from '@/shared/components/icons'
import { SidebarTrigger } from '@/shared/components/ui/sidebar'
import { NavLink, useLocation } from 'react-router'
import { useState } from 'react'
import { Moon, Sun, Laptop } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from '@/shared/components/ui/button'
import { ThemeToggle, useThemeState } from './theme'
import SearchBox from './SearchBox'
import { cn } from '@/shared/lib'

interface NavigationProps {
  hidden?: boolean
}

export default function Navigation({ hidden = false }: NavigationProps) {
  const { mode } = useThemeState()
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const location = useLocation()

  // 在搜索页面隐藏导航栏搜索框
  const isSearchPage = location.pathname === '/search'

  return (
    <div
      className={cn(
        'sticky top-0 z-50 w-full overflow-hidden transition-[height] duration-300 ease-in-out motion-reduce:transition-none',
      )}
      style={{ height: hidden ? '0rem' : '4rem' }}
    >
      <div
        className={cn(
          'flex w-full justify-center transition-[opacity,transform] duration-300 ease-in-out motion-reduce:transition-none',
          hidden ? 'pointer-events-none -translate-y-2 opacity-0' : 'translate-y-0 opacity-100',
        )}
      >
        <Navbar>
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

            {/* 搜索框组件 - 搜索页面时隐藏 */}
            <AnimatePresence mode="wait">
              {!isSearchPage && (
                <motion.div
                  key="navbar-search"
                  layoutId="main-search-box"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="flex flex-auto items-center"
                >
                  <SearchBox onMobileSearchChange={setIsMobileSearchOpen} />
                </motion.div>
              )}
            </AnimatePresence>

            <div
              className={`flex flex-1 justify-end gap-2 transition-all duration-300 ease-out sm:gap-0 ${
                isMobileSearchOpen
                  ? 'pointer-events-none translate-x-4 opacity-0 sm:pointer-events-auto sm:translate-x-0 sm:opacity-100'
                  : ''
              }`}
            >
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
    </div>
  )
}
