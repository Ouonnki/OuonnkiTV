import { Navbar, NavbarBrand, NavbarContent } from '@/shared/components/ui/navbar'
import { OkiLogo } from '@/shared/components/icons'
import { SidebarTrigger } from '@/shared/components/ui/sidebar'
import { NavLink } from 'react-router'
import { useSearch } from '@/shared/hooks'
import { useEffect, useState } from 'react'
import { Moon, Sun, Search, Laptop } from 'lucide-react'

import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { ThemeToggle, useThemeState } from './theme'

export default function Navigation() {
  const { search: searchQuery, searchMovie } = useSearch()
  const { mode } = useThemeState()

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
    <div className="sticky top-0 z-50 flex w-full justify-center">
      <Navbar>
        <NavbarBrand className="!flex-none">
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
        <NavbarContent justify="center">
          <div className="flex-1" />
          <div className="flex w-150 items-center">
            <div className="relative w-full">
              <Search
                className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                size={18}
              />
              <Input
                placeholder="搜索"
                className="h-10 rounded-full pr-16 pl-10"
                value={inputContent}
                onChange={e => setInputContent(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button
                size="sm"
                className="absolute top-1/2 right-1 h-8 w-20 -translate-y-1/2 rounded-full"
                onClick={() => searchMovie(inputContent)}
              >
                搜索
              </Button>
            </div>
          </div>
          <div className="flex flex-1 justify-end">
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
