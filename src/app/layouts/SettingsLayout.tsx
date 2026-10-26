import { useEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { Check, FolderCog, Info, ListVideo, Play, Settings2 } from 'lucide-react'
import { useDocumentTitle } from '@/shared/hooks'
import { cn } from '@/shared/lib'

const settingsModules = [
  { name: '视频源', icon: ListVideo, path: '/settings/source' },
  { name: '播放', icon: Play, path: '/settings/playback' },
  { name: '系统', icon: Settings2, path: '/settings/system' },
  { name: '个人配置', icon: FolderCog, path: '/settings/profile' },
  { name: '关于', icon: Info, path: '/settings/about' },
]

export default function SettingsLayout() {
  const { pathname } = useLocation()
  const navigationRef = useRef<HTMLElement>(null)
  const activeModule = settingsModules.find(module => module.path === pathname)
  useDocumentTitle(`${activeModule?.name ?? '偏好'} - 设置`)

  useEffect(() => {
    navigationRef.current
      ?.closest('[data-main-scroll-area]')
      ?.querySelector('[data-radix-scroll-area-viewport]')
      ?.scrollTo({ top: 0 })
    // Keep deep-linked categories visible in the scrolling mobile navigation.
    const activeLink = navigationRef.current?.querySelector<HTMLElement>('[aria-current="page"]')
    const navigation = navigationRef.current
    if (!activeLink || !navigation) return
    navigation.scrollLeft =
      activeLink.offsetLeft - navigation.clientWidth / 2 + activeLink.offsetWidth / 2
  }, [pathname])

  return (
    <div className="min-h-full">
      <header className="border-border bg-sidebar/80 sticky top-0 z-20 border-b backdrop-blur-md">
        <div className="flex min-h-14 flex-wrap items-center gap-x-6 px-4">
          <h1 className="shrink-0 py-3 text-base font-bold md:text-lg">设置</h1>
          <nav
            ref={navigationRef}
            aria-label="设置分类"
            className="scrollbar-hide relative order-3 -mx-1 flex w-full gap-3 overflow-x-auto md:order-none md:mx-0 md:w-auto md:gap-5"
          >
            {settingsModules.map(({ name, icon: Icon, path }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  cn(
                    'focus-visible:ring-ring relative inline-flex min-h-11 shrink-0 items-center gap-1.5 px-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset sm:text-sm md:min-h-14',
                    isActive
                      ? 'text-foreground after:bg-primary after:absolute after:inset-x-1 after:bottom-0 after:h-0.5 after:rounded-full'
                      : 'text-muted-foreground hover:text-foreground',
                  )
                }
              >
                <Icon aria-hidden="true" className="hidden size-3.5 sm:block" />
                {name}
              </NavLink>
            ))}
          </nav>
          <span className="text-muted-foreground ml-auto inline-flex items-center gap-1.5 text-xs">
            <Check aria-hidden="true" className="size-3.5" />
            偏好自动保存
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
        <Outlet />
      </div>
    </div>
  )
}
