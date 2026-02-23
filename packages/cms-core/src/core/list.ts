import type {
  VideoItem,
  VideoSource,
  SearchResult,
  Pagination,
  RequestAdapter,
  ProxyStrategy,
} from '../types'

import { buildListUrl } from '../utils/url'

/**
 * 列表请求配置
 */
export interface ListConfig {
  requestAdapter: RequestAdapter
  proxyStrategy: ProxyStrategy
}

/**
 * 获取视频源推荐/最新列表（不带搜索关键词）
 * @param source 视频源
 * @param config 请求配置
 * @param page 页码
 */
export async function listVideos(
  source: VideoSource,
  config: ListConfig,
  page: number = 1,
): Promise<SearchResult> {
  const { requestAdapter, proxyStrategy } = config

  try {
    if (!source || !source.url) {
      return {
        success: false,
        items: [],
        error: '无效的API配置',
      }
    }

    const apiUrl = buildListUrl(source.url, page)
    const finalUrl = proxyStrategy.shouldProxy(apiUrl) ? proxyStrategy.applyProxy(apiUrl) : apiUrl

    const response = await requestAdapter.fetch(finalUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
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
    console.error('列表请求错误:', error)
    return {
      success: false,
      items: [],
      error: error instanceof Error ? error.message : '请求处理失败',
    }
  }
}
