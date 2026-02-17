import { createConcurrencyLimiter } from '@ouonnki/cms-core'
import type { VideoSource } from '@ouonnki/cms-core'
import type { VideoSourceSubscription } from '@/shared/types/subscription'
import { buildProxyRequestUrl } from '@/shared/config/api.config'
import { useSettingStore } from '@/shared/store/settingStore'
import { useHealthStore, type HealthResult } from '@/shared/store/healthStore'

const DEFAULT_RESULT: HealthResult = {
  status: 'idle',
  latency: null,
  errorMessage: null,
  checkedAt: null,
}

/** 进度回调 */
export type OnProgressCallback = (completed: number, total: number) => void

/**
 * 视频源测速 — 按网络设置决定是否走代理，记录响应时间。
 * 不使用重试，测速需要反映真实首次响应时间。
 */
async function checkVideoSource(source: VideoSource): Promise<HealthResult> {
  const { defaultTimeout, isProxyEnabled, proxyUrl } = useSettingStore.getState().network
  const timeout = source.timeout || defaultTimeout

  const requestUrl = isProxyEnabled ? buildProxyRequestUrl(source.url, proxyUrl) : source.url
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort('timeout'), timeout)

  const startTime = performance.now()
  try {
    const response = await fetch(requestUrl, {
      signal: controller.signal,
      headers: { Accept: 'application/json, text/plain, */*' },
    })
    clearTimeout(timer)
    const latency = Math.round(performance.now() - startTime)

    if (response.ok) {
      return { status: 'online', latency, errorMessage: null, checkedAt: Date.now() }
    }
    return {
      status: 'offline',
      latency,
      errorMessage: `HTTP ${response.status}`,
      checkedAt: Date.now(),
    }
  } catch (error) {
    clearTimeout(timer)
    const latency = Math.round(performance.now() - startTime)

    if ((error as Error).name === 'AbortError' || String(error) === 'timeout') {
      return { status: 'timeout', latency, errorMessage: '请求超时', checkedAt: Date.now() }
    }
    return {
      status: 'error',
      latency: null,
      errorMessage: (error as Error).message || '未知错误',
      checkedAt: Date.now(),
    }
  }
}

/**
 * 订阅源 URL 可达性检测 — 直连 fetch，与 subscriptionStore 中 fetchSourcesFromUrl 一致。
 * 先用 HEAD 请求，若 405 则回退 GET。
 */
async function checkSubscriptionUrl(subscription: VideoSourceSubscription): Promise<HealthResult> {
  const { defaultTimeout } = useSettingStore.getState().network
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort('timeout'), defaultTimeout)

  const startTime = performance.now()
  try {
    const response = await fetch(subscription.url, {
      signal: controller.signal,
      method: 'HEAD',
    })
    clearTimeout(timer)
    const latency = Math.round(performance.now() - startTime)

    if (response.ok) {
      return { status: 'online', latency, errorMessage: null, checkedAt: Date.now() }
    }
    // 某些服务器不支持 HEAD，回退 GET
    if (response.status === 405) {
      return checkSubscriptionUrlGet(subscription)
    }
    return {
      status: 'offline',
      latency,
      errorMessage: `HTTP ${response.status}`,
      checkedAt: Date.now(),
    }
  } catch (error) {
    clearTimeout(timer)
    const latency = Math.round(performance.now() - startTime)
    if ((error as Error).name === 'AbortError') {
      return { status: 'timeout', latency, errorMessage: '请求超时', checkedAt: Date.now() }
    }
    return {
      status: 'error',
      latency: null,
      errorMessage: (error as Error).message || '未知错误',
      checkedAt: Date.now(),
    }
  }
}

async function checkSubscriptionUrlGet(
  subscription: VideoSourceSubscription,
): Promise<HealthResult> {
  const { defaultTimeout } = useSettingStore.getState().network
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort('timeout'), defaultTimeout)

  const startTime = performance.now()
  try {
    const response = await fetch(subscription.url, { signal: controller.signal })
    clearTimeout(timer)
    const latency = Math.round(performance.now() - startTime)
    return {
      status: response.ok ? 'online' : 'offline',
      latency,
      errorMessage: response.ok ? null : `HTTP ${response.status}`,
      checkedAt: Date.now(),
    }
  } catch (error) {
    clearTimeout(timer)
    return {
      status: 'error',
      latency: null,
      errorMessage: (error as Error).message || '未知错误',
      checkedAt: Date.now(),
    }
  }
}

/** 批量测速视频源，进度通过回调返回给调用方 */
export async function batchCheckVideoSources(
  sources: VideoSource[],
  onProgress?: OnProgressCallback,
): Promise<void> {
  if (sources.length === 0) return

  const { concurrencyLimit } = useSettingStore.getState().network
  const limiter = createConcurrencyLimiter(concurrencyLimit)

  // 将所有源标记为 testing
  useHealthStore.getState().setManyTesting(sources.map(s => s.id))

  let completed = 0
  const total = sources.length
  onProgress?.(completed, total)

  const tasks = sources.map(source =>
    limiter(async () => {
      const result = await checkVideoSource(source)
      useHealthStore.getState().setResult(source.id, result)
      completed++
      onProgress?.(completed, total)
    }),
  )

  await Promise.allSettled(tasks)
}

/** 批量测速订阅源 URL，进度通过回调返回给调用方 */
export async function batchCheckSubscriptions(
  subscriptions: VideoSourceSubscription[],
  onProgress?: OnProgressCallback,
): Promise<void> {
  if (subscriptions.length === 0) return

  const { concurrencyLimit } = useSettingStore.getState().network
  const limiter = createConcurrencyLimiter(concurrencyLimit)

  const ids = subscriptions.map(s => `subscription:${s.id}`)
  useHealthStore.getState().setManyTesting(ids)

  let completed = 0
  const total = subscriptions.length
  onProgress?.(completed, total)

  const tasks = subscriptions.map(sub =>
    limiter(async () => {
      const result = await checkSubscriptionUrl(sub)
      useHealthStore.getState().setResult(`subscription:${sub.id}`, result)
      completed++
      onProgress?.(completed, total)
    }),
  )

  await Promise.allSettled(tasks)
}

/** 单个视频源测速 */
export async function checkSingleVideoSource(source: VideoSource): Promise<void> {
  useHealthStore.getState().setResult(source.id, {
    ...DEFAULT_RESULT,
    status: 'testing',
  })
  const result = await checkVideoSource(source)
  useHealthStore.getState().setResult(source.id, result)
}
