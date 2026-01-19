import { Navbar, NavbarBrand, NavbarContent } from '@/shared/components/ui/navbar'
import { OkiLogo } from '@/shared/components/icons'
import { SidebarTrigger } from '@/shared/components/ui/sidebar'
import { NavLink } from 'react-router'
import { useState } from 'react'
import { Moon, Sun, Laptop } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { ThemeToggle, useThemeState } from './theme'
import SearchBox from './SearchBox'

export default function Navigation() {
  const { mode } = useThemeState()
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

  return (
    <div className="sticky top-0 z-50 flex w-full justify-center">
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

          {/* 搜索框组件 */}
          <SearchBox onMobileSearchChange={setIsMobileSearchOpen} />

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
  )
}
