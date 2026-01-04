import type { ProxyStrategy } from '../types'

/**
 * 创建URL前缀代理策略
 * @param proxyUrl 代理URL前缀，如 '/proxy?url='
 */
export function createUrlPrefixProxyStrategy(proxyUrl: string): ProxyStrategy {
  return {
    applyProxy(url: string): string {
      return proxyUrl + encodeURIComponent(url)
    },
    shouldProxy(): boolean {
      return true
    },
  }
}

/**
 * 创建基于域名白名单的代理策略
 * @param proxyUrl 代理URL前缀
 * @param whitelist 不需要代理的域名列表
 */
export function createWhitelistProxyStrategy(
  proxyUrl: string,
  whitelist: string[]
): ProxyStrategy {
  return {
    applyProxy(url: string): string {
      if (this.shouldProxy(url)) {
        return proxyUrl + encodeURIComponent(url)
      }
      return url
    },
    shouldProxy(url: string): boolean {
      try {
        const { hostname } = new URL(url)
        return !whitelist.some((domain) => hostname.endsWith(domain))
      } catch {
        return true
      }
    },
  }
}

/**
 * 创建直连策略（不使用代理）
 */
export function createDirectStrategy(): ProxyStrategy {
  return {
    applyProxy(url: string): string {
      return url
    },
    shouldProxy(): boolean {
      return false
    },
  }
}
