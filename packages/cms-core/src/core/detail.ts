import type {
  VideoSource,
  DetailResult,
  VideoDetail,
  RequestAdapter,
  ProxyStrategy,
  ApiPathConfig,
} from '../types'
import { DEFAULT_M3U8_PATTERN } from '../types'
import { buildDetailUrl } from '../utils/url'
import { parsePlayUrl, extractM3u8FromContent } from './parser'

/**
 * 详情获取配置
 */
export interface DetailConfig {
  requestAdapter: RequestAdapter
  proxyStrategy: ProxyStrategy
  apiConfig: ApiPathConfig
  m3u8Pattern?: RegExp
}

/**
 * 获取视频详情
 * @param id 视频ID
 * @param source 视频源
 * @param config 配置
 */
export async function getVideoDetail(
  id: string,
  source: VideoSource,
  config: DetailConfig,
): Promise<DetailResult> {
  const { requestAdapter, proxyStrategy, apiConfig, m3u8Pattern = DEFAULT_M3U8_PATTERN } = config

  try {
    if (!id) {
      return {
        success: false,
        episodes: [],
        error: '缺少视频ID参数',
      }
    }

    // 验证ID格式
    if (!/^[\w-]+$/.test(id)) {
      return {
        success: false,
        episodes: [],
        error: '无效的视频ID格式',
      }
    }

    if (!source || !source.url) {
      return {
        success: false,
        episodes: [],
        error: '无效的API配置',
      }
    }

    // 使用 detailUrl 如果存在，否则使用 url
    const baseUrl = source.detailUrl || source.url
    const detailUrl = buildDetailUrl(baseUrl, id, apiConfig)
    const finalUrl = proxyStrategy.shouldProxy(detailUrl)
      ? proxyStrategy.applyProxy(detailUrl)
      : detailUrl

    const response = await requestAdapter.fetch(finalUrl, {
      headers: apiConfig.detail.headers,
      timeout: source.timeout,
      retry: source.retry,
    })

    if (!response.ok) {
      return {
        success: false,
        episodes: [],
        error: `详情请求失败: ${response.status}`,
      }
    }

    const data = await response.json()

    if (!data || !data.list || !Array.isArray(data.list) || data.list.length === 0) {
      return {
        success: false,
        episodes: [],
        error: '获取到的详情内容无效',
      }
    }

    const videoDetail = data.list[0]

    // 解析播放地址
    let parsedEpisodes = parsePlayUrl(videoDetail.vod_play_url, videoDetail.vod_play_from)

    // 如果没有找到播放地址，尝试从内容中提取
    if (parsedEpisodes.urls.length === 0 && videoDetail.vod_content) {
      const extractedUrls = extractM3u8FromContent(videoDetail.vod_content, m3u8Pattern)
      parsedEpisodes = {
        urls: extractedUrls,
        names: extractedUrls.map((_, index) => `第${index + 1}集`),
      }
    }

    const videoInfo: VideoDetail = {
      title: videoDetail.vod_name,
      cover: videoDetail.vod_pic,
      desc: videoDetail.vod_content,
      type: videoDetail.type_name,
      year: videoDetail.vod_year,
      area: videoDetail.vod_area,
      director: videoDetail.vod_director,
      actor: videoDetail.vod_actor,
      remarks: videoDetail.vod_remarks,
      source_name: source.name,
      source_code: source.id,
      episodes_names: parsedEpisodes.names,
    }

    return {
      success: true,
      episodes: parsedEpisodes.urls,
      detailUrl,
      videoInfo,
    }
  } catch (error) {
    console.error('详情获取错误:', error)
    return {
      success: false,
      episodes: [],
      error: error instanceof Error ? error.message : '请求处理失败',
    }
  }
}
