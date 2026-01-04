import type { RequestAdapter, ProxyStrategy } from './adapter'

/**
 * API路径配置
 */
export interface ApiPathConfig {
  search: {
    /** 搜索路径模板，末尾为查询参数前缀 */
    path: string
    /** 请求头 */
    headers?: Record<string, string>
  }
  detail: {
    /** 详情路径模板，末尾为ID参数前缀 */
    path: string
    /** 请求头 */
    headers?: Record<string, string>
  }
}

/**
 * CmsClient配置
 */
export interface CmsClientConfig {
  /** API路径配置 */
  apiConfig?: Partial<ApiPathConfig>
  /** 请求适配器 */
  requestAdapter?: RequestAdapter
  /** 代理策略 */
  proxyStrategy?: ProxyStrategy
  /** 默认超时时间（毫秒） */
  defaultTimeout?: number
  /** 默认重试次数 */
  defaultRetry?: number
  /** 并发限制数 */
  concurrencyLimit?: number
  /** M3U8匹配正则 */
  m3u8Pattern?: RegExp
}

/**
 * 默认API配置
 */
export const DEFAULT_API_CONFIG: ApiPathConfig = {
  search: {
    path: '/api.php/provide/vod/?ac=videolist&wd=',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
  },
  detail: {
    path: '/api.php/provide/vod/?ac=videolist&ids=',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
  },
}

/**
 * 默认M3U8匹配正则
 */
export const DEFAULT_M3U8_PATTERN = /\$https?:\/\/[^"'\s]+?\.m3u8/g

/**
 * 默认客户端配置
 */
export const DEFAULT_CLIENT_CONFIG: Required<
  Omit<CmsClientConfig, 'requestAdapter' | 'proxyStrategy'>
> = {
  apiConfig: DEFAULT_API_CONFIG,
  defaultTimeout: 10000,
  defaultRetry: 3,
  concurrencyLimit: 3,
  m3u8Pattern: DEFAULT_M3U8_PATTERN,
}
