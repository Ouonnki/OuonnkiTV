import { useEffect, useRef } from 'react'
import { useSubscriptionStore } from '@/shared/store/subscriptionStore'

/** 检查间隔：每 60 秒 */
const CHECK_INTERVAL_MS = 60 * 1000

/**
 * 订阅源自动刷新 Hook
 * 在应用层（MainLayout）挂载，负责：
 * 1. 应用启动时刷新所有过期订阅
 * 2. 定期检查并刷新到期的订阅
 */
export function useSubscriptionAutoRefresh() {
  const refreshSubscription = useSubscriptionStore(state => state.refreshSubscription)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const checkAndRefresh = () => {
      const now = Date.now()
      const { subscriptions } = useSubscriptionStore.getState()

      for (const sub of subscriptions) {
        // 跳过禁用自动刷新的订阅
        if (sub.refreshInterval <= 0) continue

        const intervalMs = sub.refreshInterval * 60 * 1000
        const lastRefresh = sub.lastRefreshedAt
          ? new Date(sub.lastRefreshedAt).getTime()
          : 0

        if (now - lastRefresh >= intervalMs) {
          refreshSubscription(sub.id)
        }
      }
    }

    // 启动时检查一次
    checkAndRefresh()

    // 定期检查
    timerRef.current = setInterval(checkAndRefresh, CHECK_INTERVAL_MS)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [refreshSubscription])
}
