import Navigation from '@/shared/components/Navigation'
import { SidebarProvider, SidebarInset } from '@/shared/components/ui/sidebar'
import SideBar from '@/shared/components/SideBar'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import AnimatedOutlet from '@/shared/components/AnimatedOutlet'
import { lazy, Suspense, useEffect } from 'react'
import { useVersionStore } from '@/shared/store/versionStore'
import { useSettingStore } from '@/shared/store/settingStore'
import { useApiStore } from '@/shared/store/apiStore'
import { useSearchStore } from '@/shared/store/searchStore'

const UpdateModal = lazy(() => import('@/shared/components/UpdateModal'))

export default function MainLayout() {
  const { hasNewVersion, setShowUpdateModal } = useVersionStore()
  const { system } = useSettingStore()
  const { initializeEnvSources } = useApiStore()
  const { cleanExpiredCache } = useSearchStore()

  // 初始化逻辑 (从 MyRouter 迁移)
  useEffect(() => {
    cleanExpiredCache()
    const needsInitialization = localStorage.getItem('envSourcesInitialized') !== 'true'
    if (needsInitialization) {
      initializeEnvSources()
      localStorage.setItem('envSourcesInitialized', 'true')
    }
  }, [initializeEnvSources, cleanExpiredCache])

  // 版本更新检查
  useEffect(() => {
    if (hasNewVersion() && system.isUpdateLogEnabled) {
      setShowUpdateModal(true)
    }
  }, [hasNewVersion, setShowUpdateModal, system.isUpdateLogEnabled])

  return (
    <SidebarProvider
      defaultOpen={false}
      style={
        {
          '--sidebar-top': '4rem',
        } as React.CSSProperties
      }
      className="flex h-dvh flex-col overflow-hidden"
    >
      <Navigation />
      <div className="flex flex-1 overflow-hidden">
        <SideBar />
        <SidebarInset className="h-full overflow-hidden">
          <div className="h-full p-2 md:pl-1">
            <div className="border-border bg-sidebar h-full rounded-lg border py-2 shadow-sm">
              <ScrollArea className="h-full rounded-lg px-2">
                <AnimatedOutlet />
                <Suspense fallback={null}>
                  <UpdateModal />
                </Suspense>
              </ScrollArea>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
