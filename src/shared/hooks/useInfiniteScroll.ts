import { useRef, useCallback, useEffect } from 'react'

interface UseInfiniteScrollOptions {
  /** 是否还有更多内容 */
  hasMore: boolean
  /** 是否正在加载 */
  isLoading: boolean
  /** 是否允许加载（当前页已完成） */
  canLoadMore?: boolean
  /** 加载更多回调 */
  onLoadMore: () => void
  /** 距离底部多少像素触发，默认 200 */
  threshold?: number
  /** 禁用滚动加载 */
  disabled?: boolean
}

/**
 * 无限滚动 Hook
 * 监听滚动位置，当接近底部时触发加载更多
 */
export function useInfiniteScroll({
  hasMore,
  isLoading,
  canLoadMore = true,
  onLoadMore,
  threshold = 200,
  disabled = false,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const isLoadingRef = useRef(false)
  const triggerLockRef = useRef(false)

  // 同步加载状态到 ref
  useEffect(() => {
    isLoadingRef.current = isLoading
    if (!isLoading) {
      triggerLockRef.current = false
    }
  }, [isLoading])

  const tryLoadMore = useCallback(() => {
    if (disabled || !hasMore || !canLoadMore || isLoadingRef.current || triggerLockRef.current) {
      return
    }

    triggerLockRef.current = true
    onLoadMore()
  }, [disabled, hasMore, canLoadMore, onLoadMore])

  // IntersectionObserver 实现（更精确）
  useEffect(() => {
    if (disabled || !hasMore) return

    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        // 哨兵元素进入视口，且允许加载，且未在加载中
        if (entry.isIntersecting) {
          tryLoadMore()
        }
      },
      {
        rootMargin: `${threshold}px 0px`,
        threshold: 0.01,
      }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [disabled, hasMore, threshold, tryLoadMore])

  // 备用：滚动事件监听（兼容性更好）
  const handleScroll = useCallback(() => {
    if (disabled || !hasMore || !canLoadMore) {
      return
    }

    // 检查是否接近页面底部
    const scrollHeight = document.documentElement.scrollHeight
    const scrollTop = window.scrollY
    const clientHeight = window.innerHeight

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      tryLoadMore()
    }
  }, [disabled, hasMore, canLoadMore, threshold, tryLoadMore])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return { sentinelRef }
}
