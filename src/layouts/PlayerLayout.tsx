import { Outlet } from 'react-router'
import { motion } from 'framer-motion'

/**
 * PlayerLayout - 播放器独立布局
 * 全屏无导航栏，用于视频播放页面
 */
export default function PlayerLayout() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-dvh w-full"
    >
      <Outlet />
    </motion.div>
  )
}
