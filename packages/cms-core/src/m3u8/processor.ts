import { createDefaultAdFilter, composeFilters, type M3u8Filter } from './filter'

/**
 * M3U8处理器配置
 */
export interface M3u8ProcessorConfig {
  /** 是否过滤广告 */
  filterAds?: boolean
  /** 自定义过滤器 */
  customFilters?: M3u8Filter[]
}

/**
 * M3U8处理器接口
 */
export interface M3u8Processor {
  /** 处理M3U8内容 */
  process(content: string): string
  /** 添加过滤器 */
  addFilter(filter: M3u8Filter): void
  /** 移除过滤器 */
  removeFilter(filter: M3u8Filter): void
  /** 获取当前过滤器列表 */
  getFilters(): M3u8Filter[]
}

/**
 * 创建M3U8处理器
 * @param config 配置
 */
export function createM3u8Processor(config?: M3u8ProcessorConfig): M3u8Processor {
  const { filterAds = true, customFilters = [] } = config || {}

  const filters: M3u8Filter[] = []

  // 添加默认广告过滤器
  if (filterAds) {
    filters.push(createDefaultAdFilter())
  }

  // 添加自定义过滤器
  filters.push(...customFilters)

  return {
    process(content: string): string {
      if (filters.length === 0) {
        return content
      }
      return composeFilters(...filters)(content)
    },

    addFilter(filter: M3u8Filter): void {
      filters.push(filter)
    },

    removeFilter(filter: M3u8Filter): void {
      const index = filters.indexOf(filter)
      if (index !== -1) {
        filters.splice(index, 1)
      }
    },

    getFilters(): M3u8Filter[] {
      return [...filters]
    },
  }
}
