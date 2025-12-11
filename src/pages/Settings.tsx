import SideBar from '@/components/settings/layouts/SideBar'
import ModuleContent from '@/components/settings/layouts/ModuleContent'
import { useState } from 'react'
import { type SettingModuleList } from '@/types'
import { ListVideo, Info, ArrowLeft } from 'lucide-react'
import VideoSource from '@/components/settings/VideoSource'
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
      id: 'about_project',
      name: '关于',
      icon: <Info />,
      component: <AboutProject />,
    },
  ]
  const [activeId, setActiveId] = useState(SideBarModules[0].id)
  return (
    <div className="min-h-[90vh] pt-3 pb-20">
      <Button
        variant="ghost"
        className="hover:bg-white/20 hover:backdrop-blur-xl"
        onClick={() => navigate('/')}
      >
        <ArrowLeft /> 返回
      </Button>
      <div className="mt-2 flex gap-8">
        <SideBar
          className="w-70 border-r border-gray-300/70 pt-4 pr-8 pb-15"
          activeId={activeId}
          modules={SideBarModules}
          onSelect={setActiveId}
        />
        <ModuleContent
          module={SideBarModules.find(module => module.id === activeId) || SideBarModules[0]}
        />
      </div>
    </div>
  )
}
