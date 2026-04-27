import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'sonner'
import type { VideoSource } from '@ouonnki/cms-core'
import type { VideoSourceSubscription } from '@/shared/types/subscription'
import { useApiStore } from './apiStore'
import { useSettingStore } from './settingStore'

export function isSubscriptionSource(sourceId: string): boolean {
  return sourceId.startsWith('sub:')
}

export function extractSubscriptionId(sourceId: string): string | null {
  if (!isSubscriptionSource(sourceId)) return null
  return sourceId.split(':')[1]
}

function buildSubscriptionSourceId(subscriptionId: string, index: number): string {
  return `sub:${subscriptionId}:${index}`
}

export async function fetchSourcesFromUrl(url: string): Promise<Partial<VideoSource>[]> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const data = await response.json()
  if (!Array.isArray(data)) {
    throw new Error('返回数据不是数组格式')
  }

  return data
}

export function mapToSubscriptionSources(
  subscriptionId: string,
  rawSources: Partial<VideoSource>[],
): VideoSource[] {
  const { defaultTimeout, defaultRetry } = useSettingStore.getState().network
  return rawSources
    .filter(source => source.name && source.url)
    .map((source, index) => ({
      id: buildSubscriptionSourceId(subscriptionId, index),
      name: source.name!,
      url: source.url!,
      detailUrl: source.detailUrl || source.url,
      timeout: source.timeout ?? defaultTimeout,
      retry: source.retry ?? defaultRetry,
      isEnabled: source.isEnabled ?? true,
      syncOrigin: 'subscription',
      sortIndex: source.sortIndex ?? index,
      updatedAt: new Date(),
    }))
}

interface SubscriptionState {
  subscriptions: VideoSourceSubscription[]
}

interface SubscriptionActions {
  addSubscription: (url: string, name?: string, refreshInterval?: number) => Promise<void>
  removeSubscription: (subscriptionId: string) => void
  refreshSubscription: (subscriptionId: string) => Promise<void>
  refreshAllSubscriptions: () => Promise<void>
  setRefreshInterval: (subscriptionId: string, intervalMinutes: number) => void
  isUrlSubscribed: (url: string) => boolean
}

type SubscriptionStore = SubscriptionState & SubscriptionActions

const migrateSubscriptions = (
  subscriptions: VideoSourceSubscription[] | undefined,
): VideoSourceSubscription[] => {
  return (subscriptions ?? []).map(subscription => ({
    ...subscription,
    createdAt: new Date(subscription.createdAt),
    updatedAt: new Date(subscription.updatedAt ?? subscription.createdAt ?? new Date()),
    lastRefreshedAt: subscription.lastRefreshedAt ? new Date(subscription.lastRefreshedAt) : null,
  }))
}

export const useSubscriptionStore = create<SubscriptionStore>()(
  devtools(
    persist(
      immer<SubscriptionStore>((set, get) => ({
        subscriptions: [],

        addSubscription: async (url, name, refreshInterval) => {
          if (get().isUrlSubscribed(url)) {
            toast.error('该 URL 已存在订阅')
            return
          }

          let resolvedName = name || ''
          if (!resolvedName) {
            try {
              resolvedName = new URL(url).hostname
            } catch {
              resolvedName = '未命名订阅'
            }
          }

          const subscriptionId = uuidv4()
          const now = new Date()
          const subscription: VideoSourceSubscription = {
            id: subscriptionId,
            name: resolvedName,
            url,
            sourceCount: 0,
            lastRefreshedAt: null,
            lastRefreshSuccess: false,
            lastRefreshError: null,
            refreshInterval: refreshInterval ?? 60,
            createdAt: now,
            updatedAt: now,
          }

          set(state => {
            state.subscriptions.push(subscription)
          })

          await get().refreshSubscription(subscriptionId)
        },

        removeSubscription: subscriptionId => {
          const subscription = get().subscriptions.find(item => item.id === subscriptionId)
          useApiStore.getState().removeSubscriptionSources(subscriptionId)

          set(state => {
            state.subscriptions = state.subscriptions.filter(item => item.id !== subscriptionId)
          })

          if (subscription) {
            toast.success(`已取消订阅「${subscription.name}」`)
          }
        },

        refreshSubscription: async subscriptionId => {
          const subscription = get().subscriptions.find(item => item.id === subscriptionId)
          if (!subscription) return

          try {
            const rawSources = await fetchSourcesFromUrl(subscription.url)
            const sources = mapToSubscriptionSources(subscriptionId, rawSources)

            useApiStore.getState().replaceSubscriptionSources(subscriptionId, sources)

            set(state => {
              const target = state.subscriptions.find(item => item.id === subscriptionId)
              if (!target) return
              target.sourceCount = sources.length
              target.lastRefreshedAt = new Date()
              target.lastRefreshSuccess = true
              target.lastRefreshError = null
            })

            toast.success(`订阅「${subscription.name}」已刷新，共 ${sources.length} 个源`)
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误'

            set(state => {
              const target = state.subscriptions.find(item => item.id === subscriptionId)
              if (!target) return
              target.lastRefreshedAt = new Date()
              target.lastRefreshSuccess = false
              target.lastRefreshError = errorMessage
            })

            toast.error(`刷新订阅「${subscription.name}」失败：${errorMessage}`)
          }
        },

        refreshAllSubscriptions: async () => {
          const { subscriptions } = get()
          if (subscriptions.length === 0) return

          await Promise.allSettled(subscriptions.map(subscription => get().refreshSubscription(subscription.id)))
        },

        setRefreshInterval: (subscriptionId, intervalMinutes) => {
          set(state => {
            const subscription = state.subscriptions.find(item => item.id === subscriptionId)
            if (!subscription) return
            subscription.refreshInterval = intervalMinutes
            subscription.updatedAt = new Date()
          })
        },

        isUrlSubscribed: url => {
          return get().subscriptions.some(subscription => subscription.url === url)
        },
      })),
      {
        name: 'ouonnki-tv-subscription-store',
        version: 2,
        migrate: persistedState => {
          const state = persistedState as Partial<SubscriptionState> | undefined
          return {
            subscriptions: migrateSubscriptions(state?.subscriptions),
          }
        },
      },
    ),
    {
      name: 'SubscriptionStore',
    },
  ),
)
