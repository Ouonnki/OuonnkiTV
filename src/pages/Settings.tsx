import SideBar from '@/components/settings/layouts/SideBar'
import ModuleContent from '@/components/settings/layouts/ModuleContent'
import { useState } from 'react'
import { type SettingModuleList } from '@/types'
import { ListVideo, Info, ArrowLeft, Menu, Globe, Search, Play } from 'lucide-react'
import VideoSource from '@/components/settings/VideoSource'
import NetworkSettings from '@/components/settings/NetworkSettings'
import SearchSettings from '@/components/settings/SearchSettings'
import PlaybackSettings from '@/components/settings/PlaybackSettings'
import { cn } from '@/utils'
import AboutProject from '@/components/settings/AboutProject'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router'

export default function SettingsPage() {
  // 路由相关
  const navigate = useNavigate()
  // SideBar 相关
  const SideBarModules: SettingModuleList = [
    {
      id: 'video_source',
      name: '视频源管理',
      icon: <ListVideo />,
      component: <VideoSource />,
    },
    {
      id: 'network_settings',
      name: '网络设置',
      icon: <Globe />,
      component: <NetworkSettings />,
    },
    {
      id: 'search_settings',
      name: '搜索设置',
      icon: <Search />,
      component: <SearchSettings />,
    },
    {
      id: 'playback_settings',
      name: '播放设置',
      icon: <Play />,
      component: <PlaybackSettings />,
    },
    {
      id: 'about_project',
      name: '关于',
      icon: <Info />,
      component: <AboutProject />,
    },
  ]
  const [activeId, setActiveId] = useState(SideBarModules[0].id)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const currentModule = SideBarModules.find(module => module.id === activeId) || SideBarModules[0]

  return (
    <div className="min-h-[90vh] pt-3 pb-20">
      <div className="flex items-center justify-between px-1 pr-2 md:px-0">
        <Button
          variant="ghost"
          className="hover:bg-white/20 hover:backdrop-blur-xl"
          onClick={() => navigate('/')}
        >
          <ArrowLeft /> 返回
        </Button>
        <div className="flex items-center gap-0 md:hidden">
          <Button
            variant="ghost"
            className="hover:bg-white/20 hover:backdrop-blur-xl"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <span className="text-sm font-medium text-gray-700">{currentModule.name}</span>
            <Menu />
          </Button>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-4 md:flex-row md:gap-8">
        <div
          className={cn(
            'transition-all duration-400 ease-in md:block md:min-h-[80vh] md:w-70 md:opacity-100',
            isSidebarOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 md:max-h-none',
          )}
        >
          <div className="px-5 md:px-0">
            <SideBar
              className="w-full border-r-0 border-gray-300/70 pb-2 md:w-full md:border-r md:pt-4 md:pr-8 md:pb-15 md:pl-2"
              activeId={activeId}
              modules={SideBarModules}
              onSelect={id => {
                setActiveId(id)
                setIsSidebarOpen(false)
              }}
            />
          </div>
        </div>
        <ModuleContent module={currentModule} />
      </div>
    </div>
  )
}
