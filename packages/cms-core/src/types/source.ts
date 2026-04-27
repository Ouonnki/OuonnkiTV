/**
 * 视频源配置
 */
export interface VideoSource {
  /** 唯一标识 */
  id: string
  /** 源名称 */
  name: string
  /** 搜索 API 基础地址 */
  url: string
  /** 详情 API 基础地址，可选，默认使用 url */
  detailUrl?: string
  /** 请求超时时间，毫秒 */
  timeout?: number
  /** 重试次数 */
  retry?: number
  /** 是否启用 */
  isEnabled: boolean
  /** 源的管理来源 */
  syncOrigin?: 'env' | 'manual' | 'subscription'
  /** 用于保持排序的序号 */
  sortIndex?: number
  /** 最后更新时间 */
  updatedAt?: Date
}

/**
 * 视频源存储
 */
export interface SourceStore {
  sources: VideoSource[]
  version: number
}

/**
 * 创建空的视频源存储
 */
export function createEmptySourceStore(): SourceStore {
  return {
    sources: [],
    version: 1,
  }
}
