/**
 * 播放地址解析结果
 */
export interface ParsedEpisodes {
  /** 播放地址列表 */
  urls: string[]
  /** 集数名称列表 */
  names: string[]
}

/**
 * 解析播放URL字符串
 * @param vodPlayUrl CMS返回的vod_play_url字符串
 * @param vodPlayFrom CMS返回的vod_play_from字符串
 */
export function parsePlayUrl(vodPlayUrl: string, vodPlayFrom?: string): ParsedEpisodes {
  if (!vodPlayUrl) {
    return { urls: [], names: [] }
  }

  const playSources = vodPlayUrl.split('$$$')
  const playFroms = (vodPlayFrom || '').split('$$$')

  if (playSources.length === 0) {
    return { urls: [], names: [] }
  }

  // 优先选择包含 m3u8 的源
  let sourceIndex = playFroms.findIndex(from => from.toLowerCase().includes('m3u8'))

  // 如果没找到，默认使用最后一个
  if (sourceIndex === -1) {
    sourceIndex = playSources.length - 1
  }

  // 确保索引在有效范围内
  if (sourceIndex >= playSources.length) {
    sourceIndex = playSources.length - 1
  }

  const mainSource = playSources[sourceIndex]
  const episodeList = mainSource.split('#')

  const urls = episodeList
    .map(ep => {
      const parts = ep.split('$')
      return parts.length > 1 ? parts[1] : ''
    })
    .filter(url => url && (url.startsWith('http://') || url.startsWith('https://')))

  const names = episodeList.map((ep, index) => {
    const parts = ep.split('$')
    return parts.length > 1 ? parts[0] : `第${index + 1}集`
  })

  return { urls, names }
}

/**
 * 从视频内容中提取M3U8链接
 * @param vodContent 视频内容字符串
 * @param pattern M3U8匹配正则
 */
export function extractM3u8FromContent(
  vodContent: string,
  pattern: RegExp = /\$https?:\/\/[^"'\s]+?\.m3u8/g,
): string[] {
  if (!vodContent) {
    return []
  }

  const matches = vodContent.match(pattern) || []
  return matches.map(link => link.replace(/^\$/, ''))
}
