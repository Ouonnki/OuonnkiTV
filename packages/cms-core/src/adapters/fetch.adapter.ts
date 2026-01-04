import type { RequestAdapter, RequestConfig } from '../types'

/**
 * 默认Fetch请求适配器
 */
export function createFetchAdapter(): RequestAdapter {
  return {
    async fetch(url: string, config?: RequestConfig): Promise<Response> {
      const { timeout = 10000, retry = 3, headers, signal } = config || {}

      return fetchWithTimeout(url, { headers, signal }, timeout, retry)
    },
  }
}

/**
 * 带超时和重试的fetch实现
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number,
  retry: number
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort('request timeout')
  }, timeout)

  // 合并外部signal和超时signal
  const originalSignal = options.signal
  if (originalSignal) {
    originalSignal.addEventListener('abort', () => {
      controller.abort(originalSignal.reason)
    })
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)

    if (retry > 0 && (error as Error).name !== 'AbortError') {
      console.warn(`请求失败，正在重试 (剩余${retry}次):`, error)
      return fetchWithTimeout(url, options, timeout, retry - 1)
    }

    throw error
  }
}
