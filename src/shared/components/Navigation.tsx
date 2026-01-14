import { Navbar, NavbarBrand, NavbarContent } from '@/shared/components/ui/navbar'
import { OkiLogo } from '@/shared/components/icons'
import { NavLink } from 'react-router'
import { useSearch } from '@/shared/hooks'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'

import { ThemeToggle, useThemeState } from './theme'

export default function Navigation() {
  const { search: searchQuery, searchMovie } = useSearch()
  const { isDark } = useThemeState()

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
    <div className="sticky top-0 z-50 flex justify-center">
      <Navbar>
        <NavbarBrand className="!flex-none">
          <NavLink to="/" className="flex items-center">
            <div className="flex items-end">
              <div>
                <OkiLogo />
              </div>
              <p className="text-accent-foreground text-lg font-bold">OUONNKI TV</p>
            </div>
          </NavLink>
        </NavbarBrand>
        <NavbarContent justify="center" className="">
          <div className="flex-1" />
          <div className="flex w-150 items-center">
            <Input
              placeholder="搜索"
              value={inputContent}
              onChange={e => setInputContent(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="flex flex-1 justify-end">
            <ThemeToggle>
              <Button size="icon" variant="ghost">
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </Button>
            </ThemeToggle>
          </div>
        </NavbarContent>
      </Navbar>
    </div>
  )
}
