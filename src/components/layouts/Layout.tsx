import { Outlet } from 'react-router'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function Layout() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ScrollArea className="h-dvh">
        <Navigation />
        <div className="mx-auto max-w-300">
          <Outlet />
        </div>
      </ScrollArea>
    </motion.div>
  )
}
