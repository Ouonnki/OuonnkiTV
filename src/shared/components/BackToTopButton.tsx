import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronUp } from 'lucide-react'
import { useLocation } from 'react-router'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib'

interface BackToTopButtonProps {
  /** 触发显示按钮的滚动阈值（像素） */
  threshold?: number
  /** ScrollArea 根节点选择器 */
  scrollRootSelector: string
  className?: string
}

const getScrollTop = (target: HTMLElement | Window): number => {
  return target instanceof Window ? target.scrollY : target.scrollTop
}

const scrollToTop = (target: HTMLElement | Window) => {
  if (target instanceof Window) {
    target.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  target.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * BackToTopButton - 全局回到顶部按钮
 * 监听主滚动容器，在滚动超过阈值后显示
 */
export default function BackToTopButton({
  threshold = 280,
  scrollRootSelector,
  className,
}: BackToTopButtonProps) {
  const location = useLocation()
  const [scrollTarget, setScrollTarget] = useState<HTMLElement | Window | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(scrollRootSelector)
    const viewport = root?.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')
    setScrollTarget(viewport ?? window)
  }, [scrollRootSelector])

  useEffect(() => {
    if (!scrollTarget) return

    const handleScroll = () => {
      setVisible(getScrollTop(scrollTarget) > threshold)
    }

    handleScroll()
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll)
    }
  }, [scrollTarget, threshold])

  useEffect(() => {
    if (!scrollTarget) return

    if (scrollTarget instanceof Window) {
      scrollTarget.scrollTo({ top: 0 })
    } else {
      scrollTarget.scrollTop = 0
    }

    setVisible(false)
  }, [location.pathname, scrollTarget])

  return (
    <div
      className={cn(
        'pointer-events-none absolute right-4 bottom-6 z-40 md:right-6 md:bottom-8',
        className,
      )}
    >
      <AnimatePresence>
        {visible && scrollTarget && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="pointer-events-auto"
          >
            <Button
              type="button"
              size="icon-lg"
              variant="outline"
              aria-label="回到顶部"
              title="回到顶部"
              className="bg-background/90 rounded-full shadow-lg backdrop-blur-sm"
              onClick={() => scrollToTop(scrollTarget)}
            >
              <ChevronUp className="size-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
