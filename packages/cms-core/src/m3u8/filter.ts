/**
 * M3U8过滤器类型
 */
export type M3u8Filter = (content: string) => string

/**
 * 创建默认广告过滤器
 * 移除 #EXT-X-DISCONTINUITY 标记（常用于广告分隔）
 */
export function createDefaultAdFilter(): M3u8Filter {
  return (content: string): string => {
    if (!content) return ''

    const lines = content.split('\n')
    const filteredLines = lines.filter((line) => !line.includes('#EXT-X-DISCONTINUITY'))

    return filteredLines.join('\n')
  }
}

/**
 * 创建基于模式的过滤器
 * @param patterns 要移除的行的正则模式
 */
export function createPatternFilter(patterns: RegExp[]): M3u8Filter {
  return (content: string): string => {
    if (!content) return ''

    const lines = content.split('\n')
    const filteredLines = lines.filter((line) => {
      return !patterns.some((pattern) => pattern.test(line))
    })

    return filteredLines.join('\n')
  }
}

/**
 * 组合多个过滤器
 * @param filters 过滤器列表
 */
export function composeFilters(...filters: M3u8Filter[]): M3u8Filter {
  return (content: string): string => {
    return filters.reduce((acc, filter) => filter(acc), content)
  }
}
