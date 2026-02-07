import type {
  VideoItem,
  VideoSource,
  SearchResult,
  Pagination,
  RequestAdapter,
  ProxyStrategy,
  ApiPathConfig,
} from '../types'

import { buildSearchUrl } from '../utils/url'

/**
 * 搜索配置
 */
export interface SearchConfig {
  requestAdapter: RequestAdapter
  proxyStrategy: ProxyStrategy
  apiConfig: ApiPathConfig
}

/**
 * 单源搜索
 * @param query 搜索关键词
 * @param source 视频源
 * @param config 搜索配置
 */
export async function searchVideos(
  query: string,
  source: VideoSource,
  config: SearchConfig,
  page: number = 1,
): Promise<SearchResult> {
  const { requestAdapter, proxyStrategy, apiConfig } = config

  try {
    if (!query) {
      return {
        success: false,
        items: [],
        error: '缺少搜索参数',
      }
    }

    if (!source || !source.url) {
      return {
        success: false,
        items: [],
        error: '无效的API配置',
      }
    }

    const apiUrl = buildSearchUrl(source.url, query, page, apiConfig)
    const finalUrl = proxyStrategy.shouldProxy(apiUrl) ? proxyStrategy.applyProxy(apiUrl) : apiUrl

    const response = await requestAdapter.fetch(finalUrl, {
      headers: apiConfig.search.headers,
      timeout: source.timeout,
      retry: source.retry,
    })

    if (!response.ok) {
      return {
        success: false,
        items: [],
        error: `API请求失败: ${response.status}`,
      }
    }

    const data = await response.json()

    if (!data || !Array.isArray(data.list)) {
      return {
        success: false,
        items: [],
        error: 'API返回的数据格式无效',
      }
    }

    // 添加源信息到每个结果
    const items: VideoItem[] = data.list.map((item: VideoItem) => ({
      ...item,
      source_name: source.name,
      source_code: source.id,
      api_url: source.url,
    }))

    // 解析分页信息
    const pagination: Pagination = {
      page: Number(data.page) || page,
      totalPages: Number(data.pagecount) || 0,
      totalResults: Number(data.total) || 0,
    }

    return {
      success: true,
      items,
      pagination,
    }
  } catch (error) {
    console.error('搜索错误:', error)
    return {
      success: false,
      items: [],
      error: error instanceof Error ? error.message : '请求处理失败',
    }
  }
}
