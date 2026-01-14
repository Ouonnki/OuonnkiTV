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
} from '@/shared/components/ui/sidebar'

import { Home, Star, History, Settings } from 'lucide-react'

export default function SideBar({ className }: { className?: string }) {
  const location = useLocation()
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
  return (
    <Sidebar className={className} variant="floating" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.content.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
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
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
