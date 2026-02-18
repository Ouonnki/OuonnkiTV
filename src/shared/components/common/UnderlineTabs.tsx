import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib'

export interface UnderlineTabOption<TKey extends string = string> {
  key: TKey
  label: ReactNode
  indicatorClassName?: string
}

interface UnderlineTabsProps<TKey extends string = string> {
  options: Array<UnderlineTabOption<TKey>>
  activeKey: TKey
  onChange: (key: TKey) => void
  layoutId?: string
  className?: string
  scrollContainerClassName?: string
  listClassName?: string
  tabButtonClassName?: string
  activeTextClassName?: string
  inactiveTextClassName?: string
  indicatorClassName?: string
  showEdgeHint?: boolean
  leftEdgeClassName?: string
  rightEdgeClassName?: string
}

export function UnderlineTabs<TKey extends string = string>({
  options,
  activeKey,
  onChange,
  layoutId = 'underline-tabs-indicator',
  className,
  scrollContainerClassName,
  listClassName,
  tabButtonClassName,
  activeTextClassName = 'text-foreground',
  inactiveTextClassName = 'text-muted-foreground hover:text-foreground/80',
  indicatorClassName,
  showEdgeHint = true,
  leftEdgeClassName,
  rightEdgeClassName,
}: UnderlineTabsProps<TKey>) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const [edgeHint, setEdgeHint] = useState({ left: false, right: false })

  useEffect(() => {
    if (!showEdgeHint) return

    const scrollEl = scrollRef.current
    const innerListEl = listRef.current
    if (!scrollEl || !innerListEl) return

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
    resizeObserver.observe(innerListEl)

    return () => {
      scrollEl.removeEventListener('scroll', updateEdgeHint)
      window.removeEventListener('resize', updateEdgeHint)
      resizeObserver.disconnect()
    }
  }, [options.length, showEdgeHint])

  return (
    <section className={cn('relative', className)}>
      <div
        ref={scrollRef}
        className={cn('scrollbar-hide overflow-x-auto', scrollContainerClassName)}
      >
        <div
          ref={listRef}
          className={cn('relative flex min-w-max items-center gap-3 md:gap-5', listClassName)}
        >
          {options.map(option => {
            const isActive = option.key === activeKey
            return (
              <button
                key={option.key}
                type="button"
                className={cn(
                  'relative shrink-0 px-1 py-1.5 text-xs font-medium whitespace-nowrap md:py-2 md:text-sm',
                  tabButtonClassName,
                )}
                onClick={() => onChange(option.key)}
              >
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 transition-colors',
                    isActive ? activeTextClassName : inactiveTextClassName,
                  )}
                >
                  {option.label}
                </span>
                {isActive ? (
                  <motion.span
                    layoutId={layoutId}
                    className={cn(
                      'absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-primary',
                      option.indicatorClassName,
                      indicatorClassName,
                    )}
                    transition={{ type: 'spring', stiffness: 420, damping: 38, mass: 0.35 }}
                  />
                ) : null}
              </button>
            )
          })}
        </div>
      </div>
      {showEdgeHint ? (
        <>
          <div
            className={cn(
              'pointer-events-none absolute top-0 bottom-[3px] left-0 z-10 w-9 rounded-r-2xl bg-gradient-to-r from-background/85 via-background/45 to-transparent transition-opacity duration-300 ease-out',
              edgeHint.left ? 'opacity-100' : 'opacity-0',
              leftEdgeClassName,
            )}
          />
          <div
            className={cn(
              'pointer-events-none absolute top-0 right-0 bottom-[3px] z-10 w-10 rounded-l-2xl bg-gradient-to-l from-background/85 via-background/45 to-transparent transition-opacity duration-300 ease-out',
              edgeHint.right ? 'opacity-100' : 'opacity-0',
              rightEdgeClassName,
            )}
          />
        </>
      ) : null}
    </section>
  )
}
