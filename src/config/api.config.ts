// API 配置
export const API_CONFIG = {
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

// 其他配置
// 统一使用内置代理
export const PROXY_URL = '/proxy?url='
export const M3U8_PATTERN = /\$https?:\/\/[^"'\s]+?\.m3u8/g

// 从环境变量获取初始视频源
export const getInitialVideoSources = async () => {
  let envSources = import.meta.env.VITE_INITIAL_VIDEO_SOURCES

  // 验证url
  try {
    new URL(envSources.trim())
    const response = await fetch(PROXY_URL + envSources.trim())
    if (!response.ok) {
      console.error(`无法获取视频源，HTTP状态: ${response.status}`)
      return []
    }
    envSources = await response.text()
  } catch {
    // 不是URL，继续处理
  }

  if (!envSources || typeof envSources !== 'string') {
    return []
  }

  try {
    // 清理多行JSON：移除不必要的换行符和空白字符，但保留JSON结构内的空格
    const cleanedSources = envSources
      .replace(/^\s*['"`]/, '') // 移除开头的引号
      .replace(/['"`]\s*$/, '') // 移除结尾的引号
      .trim()

    // 解析 JSON 格式
    const jsonSources = JSON.parse(cleanedSources)
    const sources = Array.isArray(jsonSources) ? jsonSources : [jsonSources]

    return sources
      .map((source, index) => {
        if (!source.name || !source.url) {
          console.warn(`跳过无效的视频源配置: ${JSON.stringify(source)}`)
          return null
        }

        return {
          id: source.id || `env_source_${index}`,
          name: source.name,
          url: source.url,
          detailUrl: source.detailUrl || source.url,
          isEnabled: source.isEnabled !== undefined ? source.isEnabled : true,
        }
      })
      .filter(Boolean)
  } catch (error) {
    console.error('解析环境变量中的视频源失败:', error)
    console.error('环境变量内容:', envSources)
    return []
  }
}
