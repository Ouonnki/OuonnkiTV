import type { RefObject } from 'react'
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
  return (
    <section className="-mt-px flex justify-center">
      <div ref={tabListRef} className="relative flex items-center gap-6">
        {tabItems.map(tab => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              data-tab={tab.key}
              className="relative px-1 py-3 text-sm font-medium"
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
    </section>
  )
}
