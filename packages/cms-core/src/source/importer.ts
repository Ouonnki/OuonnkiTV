import type { VideoSource, SourceStore } from '../types'
import { addSource } from './store'
import { validateSource } from './validator'

/**
 * 导入结果
 */
export interface ImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: string[]
}

/**
 * 批量导入视频源
 * @param store 当前存储状态
 * @param sources 要导入的视频源
 * @param options 导入选项
 * @returns 新的存储状态和导入结果
 */
export function importSources(
  store: SourceStore,
  sources: Partial<VideoSource>[],
  options?: {
    /** 默认超时时间 */
    defaultTimeout?: number
    /** 默认重试次数 */
    defaultRetry?: number
    /** 是否跳过验证失败的源 */
    skipInvalid?: boolean
  },
): { store: SourceStore; result: ImportResult } {
  const { defaultTimeout = 3000, defaultRetry = 3, skipInvalid = true } = options || {}

  let newStore = store
  let imported = 0
  let skipped = 0
  const errors: string[] = []

  for (const source of sources) {
    const validation = validateSource(source)

    if (!validation.valid) {
      if (skipInvalid) {
        skipped++
        errors.push(`跳过无效源 "${source.name || '未命名'}": ${validation.errors.join(', ')}`)
        continue
      } else {
        errors.push(`源 "${source.name || '未命名'}" 验证失败: ${validation.errors.join(', ')}`)
        continue
      }
    }

    // 创建完整的视频源对象
    const fullSource: VideoSource = {
      id: source.id || generateId(),
      name: source.name!,
      url: source.url!,
      detailUrl: source.detailUrl || source.url,
      timeout: source.timeout ?? defaultTimeout,
      retry: source.retry ?? defaultRetry,
      isEnabled: source.isEnabled ?? true,
      updatedAt: source.updatedAt || new Date(),
    }

    // 检查是否已存在
    const exists = newStore.sources.some(
      s => s.id === fullSource.id || (s.name === fullSource.name && s.url === fullSource.url),
    )

    if (exists) {
      skipped++
      continue
    }

    newStore = addSource(newStore, fullSource)
    imported++
  }

  return {
    store: newStore,
    result: {
      success: errors.length === 0 || skipInvalid,
      imported,
      skipped,
      errors,
    },
  }
}

/**
 * 导出视频源
 * @param store 存储状态
 * @returns 视频源数组
 */
export function exportSources(store: SourceStore): VideoSource[] {
  return store.sources.map(s => ({ ...s }))
}

/**
 * 从JSON字符串解析视频源
 * @param json JSON字符串
 */
export function parseSourcesFromJson(json: string): Partial<VideoSource>[] {
  try {
    // 清理JSON字符串
    const cleanedJson = json
      .replace(/^\s*['"`]/, '')
      .replace(/['"`]\s*$/, '')
      .trim()

    const parsed = JSON.parse(cleanedJson)
    const sources = Array.isArray(parsed) ? parsed : [parsed]

    return sources
  } catch (error) {
    console.error('解析JSON失败:', error)
    return []
  }
}

/**
 * 从URL获取视频源
 * @param url 远程URL
 * @param fetchFn 可选的fetch函数
 */
export async function parseSourcesFromUrl(
  url: string,
  fetchFn: typeof fetch = fetch,
): Promise<Partial<VideoSource>[]> {
  try {
    const response = await fetchFn(url)
    if (!response.ok) {
      console.error(`获取视频源失败，HTTP状态: ${response.status}`)
      return []
    }

    const text = await response.text()
    return parseSourcesFromJson(text)
  } catch (error) {
    console.error('获取视频源失败:', error)
    return []
  }
}

/**
 * 生成唯一ID
 */
function generateId(): string {
  // 简单的ID生成，不依赖uuid库
  return `source_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
