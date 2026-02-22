import { useLocation } from 'react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
  SidebarHeader,
  useSidebar,
} from '@/shared/components/ui/sidebar'
import { NavLink } from 'react-router'
import { motion } from 'framer-motion'
import { Home, Search, Star, History, Settings } from 'lucide-react'
import { OkiLogo } from '@/shared/components/icons'
import { useVersionStore } from '../store'
import { cn } from '@/shared/lib'

interface SideBarProps {
  className?: string
  collapsibleMode?: 'icon' | 'offcanvas'
  hidden?: boolean
}

export default function SideBar({
  className,
  collapsibleMode = 'icon',
  hidden = false,
}: SideBarProps) {
  const location = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()

  const handleNavLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  // Menu items.
  const items = {
    header: [],
    content: [
      {
        title: '主页',
        url: '/',
        icon: Home,
      },
      {
        title: '搜索中心',
        url: '/search',
        icon: Search,
      },
      {
        title: '收藏夹',
        url: '/favorites',
        icon: Star,
      },
      {
        title: '观看记录',
        url: '/history',
        icon: History,
      },
    ],
    footer: [
      {
        title: '设置',
        url: '/settings',
        icon: Settings,
      },
    ],
  }
  // 获取版本信息
  const { currentVersion } = useVersionStore()
  return (
    <Sidebar
      className={cn(
        '[&_[data-slot=sidebar-gap]]:duration-300 [&_[data-slot=sidebar-gap]]:ease-in-out',
        '[&_[data-slot=sidebar-container]]:duration-300 [&_[data-slot=sidebar-container]]:ease-in-out',
        '[&_[data-slot=sidebar-inner]]:transition-opacity [&_[data-slot=sidebar-inner]]:duration-300',
        hidden &&
          '[&_[data-slot=sidebar-gap]]:!w-0 [&_[data-slot=sidebar-container]]:!w-0 [&_[data-slot=sidebar-container]]:overflow-hidden [&_[data-slot=sidebar-inner]]:opacity-0',
        className,
      )}
      variant="floating"
      collapsible={collapsibleMode}
    >
      <SidebarHeader className="sm:hidden">
        <NavLink to="/" className="flex items-center" onClick={handleNavLinkClick}>
          <div className="flex items-end">
            <div>
              <OkiLogo />
            </div>
            <p className="text-accent-foreground text-lg font-bold">OUONNKI TV</p>
          </div>
        </NavLink>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>主菜单</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {items.content.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      onClick={handleNavLinkClick}
                      className="group data-[mactive=true]:text-sidebar-primary-foreground relative h-10 overflow-visible"
                      data-mactive={location.pathname === item.url}
                    >
                      {location.pathname === item.url && (
                        <motion.div
                          layoutId="sidebar-selected-item"
                          className="bg-sidebar-primary absolute top-0 left-0 h-full w-full rounded-md"
                          transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                      <item.icon className="z-1" />
                      <span className="z-1">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {items.footer.map(item => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink to={item.url} onClick={handleNavLinkClick}>
                  <item.icon />
                  <span className="flex w-full items-center justify-between">
                    <span>{item.title}</span>
                    <span className="text-muted-foreground text-xs">v{currentVersion}</span>
                  </span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
