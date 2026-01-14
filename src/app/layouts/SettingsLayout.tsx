import { Outlet, NavLink, useNavigate } from 'react-router'
import { useState } from 'react'
import { cn } from '@/shared/lib'
import { Button } from '@/shared/components/ui/button'
import { ArrowLeft, Menu, ListVideo, Play, Settings, Info } from 'lucide-react'

const settingsModules = [
  { id: 'source', name: '视频源管理', icon: ListVideo, path: '/settings/source' },
  { id: 'playback', name: '播放设置', icon: Play, path: '/settings/playback' },
  { id: 'system', name: '系统设置', icon: Settings, path: '/settings/system' },
  { id: 'about', name: '关于', icon: Info, path: '/settings/about' },
]

/**
 * SettingsLayout - 设置页面布局
 * 带侧边栏导航的子路由布局
 */
export default function SettingsLayout() {
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-[90vh] pt-3 pb-20">
      {/* 顶部返回按钮 */}
      <div className="flex items-center justify-between px-1 pr-2 md:px-0">
        <Button
          variant="ghost"
          className="hover:bg-white/20 hover:backdrop-blur-xl"
          onClick={() => navigate('/')}
        >
          <ArrowLeft /> 返回
        </Button>
        {/* 移动端菜单按钮 */}
        <div className="flex items-center gap-0 md:hidden">
          <Button
            variant="ghost"
            className="hover:bg-white/20 hover:backdrop-blur-xl"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu />
          </Button>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-4 md:flex-row md:gap-8">
        {/* 侧边栏 */}
        <div
          className={cn(
            'transition-all duration-400 ease-in md:block md:min-h-[80vh] md:w-70 md:opacity-100',
            isSidebarOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 md:max-h-none',
          )}
        >
          <div className="px-5 md:px-0">
            <nav className="w-full border-r-0 border-gray-300/70 pb-2 md:w-full md:border-r md:pt-4 md:pr-8 md:pb-15 md:pl-2">
              <ul className="space-y-1">
                {settingsModules.map(module => (
                  <li key={module.id}>
                    <NavLink
                      to={module.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-gray-200/50 text-gray-900 dark:bg-gray-800/50 dark:text-gray-100'
                            : 'text-gray-600 hover:bg-gray-100/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/30 dark:hover:text-gray-100',
                        )
                      }
                    >
                      <module.icon className="h-5 w-5" />
                      {module.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 px-4 md:px-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
