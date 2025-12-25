import { Outlet } from 'react-router'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import { ScrollArea } from '@/components/ui/scroll-area'
import { lazy, Suspense, useEffect } from 'react'
import { useVersionStore } from '@/store/versionStore'
import { useSettingStore } from '@/store/settingStore'
import { useApiStore } from '@/store/apiStore'
import { useSearchStore } from '@/store/searchStore'

const UpdateModal = lazy(() => import('@/components/UpdateModal'))

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Suspense fallback={null}>
        <UpdateModal />
      </Suspense>
      <ScrollArea className="h-dvh">
        <Navigation />
        <div className="mx-auto max-w-300">
          <Outlet />
        </div>
      </ScrollArea>
    </motion.div>
  )
}
