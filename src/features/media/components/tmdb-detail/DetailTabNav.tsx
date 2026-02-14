import { useEffect, useRef, useState, type RefObject } from 'react'
import { motion } from 'framer-motion'
import type { DetailTab } from './types'

interface TabIndicator {
  x: number
  width: number
  ready: boolean
}

interface DetailTabNavProps {
  tabListRef: RefObject<HTMLDivElement | null>
  tabItems: Array<{ key: DetailTab; label: string }>
  activeTab: DetailTab
  onTabChange: (tab: DetailTab) => void
  tabIndicator: TabIndicator
}

export function DetailTabNav({
  tabListRef,
  tabItems,
  activeTab,
  onTabChange,
  tabIndicator,
}: DetailTabNavProps) {
  const navScrollRef = useRef<HTMLDivElement | null>(null)
  const [edgeHint, setEdgeHint] = useState({ left: false, right: false })

  useEffect(() => {
    const scrollEl = navScrollRef.current
    const listEl = tabListRef.current
    if (!scrollEl || !listEl) return

    const updateEdgeHint = () => {
      const overflow = scrollEl.scrollWidth > scrollEl.clientWidth + 1
      if (!overflow) {
        setEdgeHint(prev => (prev.left || prev.right ? { left: false, right: false } : prev))
        return
      }

      const maxScrollLeft = scrollEl.scrollWidth - scrollEl.clientWidth
      const nextLeft = scrollEl.scrollLeft > 2
      const nextRight = scrollEl.scrollLeft < maxScrollLeft - 2

      setEdgeHint(prev =>
        prev.left === nextLeft && prev.right === nextRight
          ? prev
          : { left: nextLeft, right: nextRight },
      )
    }

    updateEdgeHint()
    scrollEl.addEventListener('scroll', updateEdgeHint, { passive: true })
    window.addEventListener('resize', updateEdgeHint)

    const resizeObserver = new ResizeObserver(updateEdgeHint)
    resizeObserver.observe(scrollEl)
    resizeObserver.observe(listEl)

    return () => {
      scrollEl.removeEventListener('scroll', updateEdgeHint)
      window.removeEventListener('resize', updateEdgeHint)
      resizeObserver.disconnect()
    }
  }, [tabItems.length, tabListRef])

  return (
    <section className="-mt-px relative px-2 md:flex md:justify-center md:px-0">
      <div ref={navScrollRef} className="scrollbar-hide overflow-x-auto md:overflow-visible">
        <div ref={tabListRef} className="relative flex min-w-max items-center gap-4 md:gap-6">
          {tabItems.map(tab => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                data-tab={tab.key}
                className="relative shrink-0 whitespace-nowrap px-1 py-3 text-sm font-medium"
                onClick={() => onTabChange(tab.key)}
              >
                <span className={isActive ? 'text-foreground' : 'text-muted-foreground'}>{tab.label}</span>
              </button>
            )
          })}
          {tabIndicator.ready && (
            <motion.div
              className="bg-primary pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-full"
              initial={false}
              animate={{ x: tabIndicator.x, width: tabIndicator.width }}
              transition={{ type: 'spring', stiffness: 420, damping: 38, mass: 0.35 }}
            />
          )}
        </div>
      </div>
      <div
        className={`pointer-events-none absolute top-1 bottom-1 left-0 z-10 w-5 rounded-full bg-gradient-to-r from-background/85 via-background/45 to-transparent transition-opacity duration-300 ease-out md:hidden ${
          edgeHint.left ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        className={`pointer-events-none absolute top-1 bottom-1 right-0 z-10 w-6 rounded-full bg-gradient-to-l from-background/85 via-background/45 to-transparent transition-opacity duration-300 ease-out md:hidden ${
          edgeHint.right ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </section>
  )
}
