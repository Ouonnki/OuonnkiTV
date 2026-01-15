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
              <p className="text-accent-foreground hidden text-lg font-bold sm:block">OUONNKI TV</p>
            </div>
          </NavLink>
        </NavbarBrand>
        <NavbarContent justify="center" className="gap-2">
          <div className="flex-1" />
          <div className="flex flex-auto items-center">
            <div className="group relative w-full" data-has-content={inputContent.length > 0}>
              <Search
                className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                size={18}
              />
              <Input
                placeholder="搜索"
                className="h-9 rounded-full pr-17 pl-10 overflow-ellipsis"
                value={inputContent}
                onChange={e => setInputContent(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button
                size="sm"
                disabled={inputContent.length === 0}
                className="absolute top-1/2 right-1 h-0 w-0 -translate-y-1/2 overflow-hidden rounded-full px-0 opacity-0 group-data-[has-content=true]:h-7 group-data-[has-content=true]:w-16 group-data-[has-content=true]:px-3 group-data-[has-content=true]:opacity-100"
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
