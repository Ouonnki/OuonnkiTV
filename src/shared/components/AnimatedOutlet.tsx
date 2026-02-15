import { useLocation, useOutlet } from 'react-router'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { useRef } from 'react'
import { pageVariants } from '@/shared/lib/animationVariants'

/**
 * AnimatedOutlet - 带页面过渡动画的 Outlet 包装组件
 *
 * 使用 framer-motion 的 AnimatePresence 实现路由切换时的平滑过渡动画。
 * 动画效果：淡入淡出 + 轻微的垂直位移 + 模糊效果
 */
export default function AnimatedOutlet() {
  const location = useLocation()
  const outlet = useOutlet()

  // 使用 ref 缓存当前 outlet，确保退出动画时仍能渲染正确的内容
  const outletRef = useRef(outlet)

  // 当路由变化时更新缓存的 outlet
  if (outlet) {
    outletRef.current = outlet
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="h-full"
      >
        {outlet || outletRef.current}
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * 可配置的动画 Outlet 组件
 * 支持自定义动画变体和类名
 */
interface CustomAnimatedOutletProps {
  variants?: Variants
  className?: string
  /** 是否启用动画，默认 true */
  enabled?: boolean
  /** 自定义路由动画 key，用于控制哪些路径共享同一动画容器 */
  routeKey?: string | ((pathname: string) => string)
}

export function CustomAnimatedOutlet({
  variants = pageVariants,
  className = 'h-full',
  enabled = true,
  routeKey,
}: CustomAnimatedOutletProps) {
  const location = useLocation()
  const outlet = useOutlet()
  const outletRef = useRef(outlet)
  const animationKey =
    typeof routeKey === 'function' ? routeKey(location.pathname) : (routeKey ?? location.pathname)

  if (outlet) {
    outletRef.current = outlet
  }

  // 如果禁用动画，直接返回 outlet
  if (!enabled) {
    return <>{outlet || outletRef.current}</>
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={animationKey}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
      >
        {outlet || outletRef.current}
      </motion.div>
    </AnimatePresence>
  )
}
