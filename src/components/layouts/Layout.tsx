import { Outlet } from 'react-router'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import { ScrollArea } from '@/components/ui/scroll-area'
import { lazy, Suspense, useEffect } from 'react'
import { useVersionStore } from '@/store/versionStore'

const UpdateModal = lazy(() => import('@/components/UpdateModal'))

export default function Layout() {
  const { hasNewVersion, setShowUpdateModal } = useVersionStore()

  useEffect(() => {
    if (hasNewVersion()) {
      setShowUpdateModal(true)
    }
  }, [hasNewVersion, setShowUpdateModal])

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
