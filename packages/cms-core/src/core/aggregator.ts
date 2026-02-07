import type { VideoItem, VideoSource, SearchResult, Pagination } from '../types'
import { createConcurrencyLimiter } from './concurrency'

/**
 * 聚合搜索选项
 */
export interface AggregatorOptions {
  /** 并发限制数 */
  concurrencyLimit: number
  /** 进度回调 */
  onProgress?: (completed: number, total: number, source: VideoSource) => void
  /** 结果回调（增量） */
  onResult?: (items: VideoItem[], source: VideoSource, pagination?: Pagination) => void
}

/**
 * 聚合搜索函数类型
 */
export type AggregatedSearchFn = (
  query: string,
  sources: VideoSource[],
  page: number,
  signal?: AbortSignal,
) => Promise<VideoItem[]>

/**
 * 创建聚合搜索函数
 * @param searchFn 单源搜索函数
 * @param options 聚合选项
 */
export function createAggregatedSearch(
  searchFn: (query: string, source: VideoSource, page: number) => Promise<SearchResult>,
  options: AggregatorOptions,
): AggregatedSearchFn {
  const { concurrencyLimit, onProgress, onResult } = options

  return async (
    query: string,
    sources: VideoSource[],
    page: number = 1,
    signal?: AbortSignal,
  ): Promise<VideoItem[]> => {
    if (sources.length === 0) {
      console.warn('没有选中任何 API 源')
      return []
    }

    let aborted = false
    if (signal) {
      if (signal.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }
      signal.addEventListener('abort', () => {
        aborted = true
      })
    }

    const seen = new Set<string>()
    const limiter = createConcurrencyLimiter(concurrencyLimit)
    let completedCount = 0

    const tasks = sources.map(source =>
      limiter(async () => {
        if (aborted) return [] as VideoItem[]

        let result: SearchResult
        try {
          result = await searchFn(query, source, page)
        } catch (error) {
          if (aborted) return [] as VideoItem[]
          console.warn(`${source.name} 源搜索失败:`, error)
          completedCount++
          onProgress?.(completedCount, sources.length, source)
          return [] as VideoItem[]
        }

        if (aborted) return [] as VideoItem[]

        completedCount++
        onProgress?.(completedCount, sources.length, source)

        if (!result.success) {
          return [] as VideoItem[]
        }

        // 去重
        const newUnique = result.items.filter(item => {
          const key = `${item.source_code}_${item.vod_id}`
          if (!seen.has(key)) {
            seen.add(key)
            return true
          }
          return false
        })

        if (aborted) return [] as VideoItem[]

        // 即使结果为空，也要记录分页信息（用于判断是否还有更多页）
        onResult?.(newUnique, source, result.pagination)

        if (newUnique.length === 0) return [] as VideoItem[]

        return newUnique
      }),
    )

    const allPromise: Promise<VideoItem[]> = Promise.all(tasks).then(chunks => chunks.flat())

    if (signal) {
      const abortPromise = new Promise<VideoItem[]>((_, reject) => {
        signal.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'))
        })
      })
      return Promise.race([allPromise, abortPromise])
    }

    return allPromise
  }
}
