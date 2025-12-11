import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type SettingModuleList } from '@/types'
import ModuleContent from './ModuleContent'
import SideBar from './SideBar'
import { useState } from 'react'
import { useVersionStore } from '@/store/versionStore'

export default function BaseLayout({
  isOpen,
  onOpenChange,
  modules,
}: {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  modules: SettingModuleList
}) {
  const [activeId, setActiveId] = useState(modules[0]?.id || '')
  const { currentVersion } = useVersionStore()

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          overlayClassName="bg-white/10 backdrop-blur-sm"
          className="h-[35rem] w-[60rem] overflow-hidden bg-white/20 p-0 backdrop-blur-2xl duration-300 md:max-w-[60rem]"
        >
          <div className="flex">
            <div className="h-full border-r border-gray-200 bg-slate-100/40 backdrop-blur-2xl">
              <DialogHeader className="border-b border-gray-200 p-5">
                <DialogTitle>个性化设置</DialogTitle>
                <DialogDescription>version {currentVersion}</DialogDescription>
              </DialogHeader>
              <div className="px-3 py-5">
                <SideBar activeId={activeId} modules={modules} onSelect={setActiveId} />
              </div>
            </div>
            <div className="scrollbar-hide max-h-[35rem] flex-1 overflow-y-scroll p-6">
              <ModuleContent
                module={modules.find(module => module.id === activeId) || modules[0]}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
