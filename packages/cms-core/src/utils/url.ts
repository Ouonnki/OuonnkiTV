import type { ApiPathConfig } from '../types'
import { DEFAULT_API_CONFIG } from '../types'

/**
 * 构建API URL
 * @param baseUrl 基础URL
 * @param configPath API路径模板
 * @param queryValue 查询值
 */
export function buildApiUrl(baseUrl: string, configPath: string, queryValue: string): string {
  // 移除 baseUrl 末尾的斜杠
  const url = baseUrl.replace(/\/+$/, '')

  // 提取 configPath 的路径部分和参数部分
  // configPath 格式如: /api.php/provide/vod/?ac=videolist&wd=
  const [pathPart, queryPart] = configPath.split('?')

  // 检查 baseUrl 是否已经包含路径部分
  // 很多源地址是 https://domain.com/api.php/provide/vod/
  if (
    url.toLowerCase().endsWith(pathPart.replace(/\/+$/, '').toLowerCase()) ||
    url.toLowerCase().includes('/api.php/provide/vod')
  ) {
    // 如果 baseUrl 已经包含路径，则只追加参数
    const prefix = url.includes('?') ? '&' : '?'
    return `${url}${prefix}${queryPart}${queryValue}`
  }

  // 否则，拼接完整路径
  return `${url}${configPath}${queryValue}`
}

/**
 * 构建搜索URL
 */
export function buildSearchUrl(
  baseUrl: string,
  query: string,
  page: number = 1,
  apiConfig: ApiPathConfig = DEFAULT_API_CONFIG
): string {
  const pageParam = page > 1 ? `&pg=${page}` : ''
  return buildApiUrl(baseUrl, apiConfig.search.path, encodeURIComponent(query) + pageParam)
}

/**
 * 构建详情URL
 */
export function buildDetailUrl(
  baseUrl: string,
  id: string,
  apiConfig: ApiPathConfig = DEFAULT_API_CONFIG
): string {
  return buildApiUrl(baseUrl, apiConfig.detail.path, id)
}

/**
 * 构建视频列表URL（不带搜索关键词，用于获取推荐/最新内容）
 */
export function buildListUrl(baseUrl: string, page: number = 1): string {
  const url = baseUrl.replace(/\/+$/, '')
  const base = url.toLowerCase().includes('/api.php/provide/vod')
    ? url
    : `${url}/api.php/provide/vod/`
  const separator = base.includes('?') ? '&' : '?'
  return page > 1 ? `${base}${separator}ac=videolist&pg=${page}` : `${base}${separator}ac=videolist`
}
