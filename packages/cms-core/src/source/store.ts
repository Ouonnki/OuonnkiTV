import type { VideoSource, SourceStore } from '../types'
import { createEmptySourceStore } from '../types'

/**
 * 添加视频源
 * @param store 当前存储状态
 * @param source 要添加的视频源
 * @returns 新的存储状态
 */
export function addSource(store: SourceStore, source: VideoSource): SourceStore {
  // 检查是否已存在
  const exists = store.sources.some(
    (s) => s.id === source.id || (s.name === source.name && s.url === source.url)
  )

  if (exists) {
    // 更新已存在的源
    return updateSource(store, source.id, source)
  }

  return {
    ...store,
    sources: [...store.sources, { ...source, updatedAt: new Date() }],
  }
}

/**
 * 移除视频源
 * @param store 当前存储状态
 * @param id 要移除的视频源ID
 * @returns 新的存储状态
 */
export function removeSource(store: SourceStore, id: string): SourceStore {
  return {
    ...store,
    sources: store.sources.filter((s) => s.id !== id),
  }
}

/**
 * 更新视频源
 * @param store 当前存储状态
 * @param id 要更新的视频源ID
 * @param updates 更新内容
 * @returns 新的存储状态
 */
export function updateSource(
  store: SourceStore,
  id: string,
  updates: Partial<VideoSource>
): SourceStore {
  return {
    ...store,
    sources: store.sources.map((s) =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
    ),
  }
}

/**
 * 切换视频源启用状态
 * @param store 当前存储状态
 * @param id 视频源ID
 * @returns 新的存储状态
 */
export function toggleSource(store: SourceStore, id: string): SourceStore {
  return {
    ...store,
    sources: store.sources.map((s) =>
      s.id === id ? { ...s, isEnabled: !s.isEnabled, updatedAt: new Date() } : s
    ),
  }
}

/**
 * 设置视频源启用状态
 * @param store 当前存储状态
 * @param id 视频源ID
 * @param enabled 是否启用
 * @returns 新的存储状态
 */
export function setSourceEnabled(
  store: SourceStore,
  id: string,
  enabled: boolean
): SourceStore {
  return updateSource(store, id, { isEnabled: enabled })
}

/**
 * 全选所有视频源
 * @param store 当前存储状态
 * @returns 新的存储状态
 */
export function selectAllSources(store: SourceStore): SourceStore {
  return {
    ...store,
    sources: store.sources.map((s) => ({ ...s, isEnabled: true })),
  }
}

/**
 * 取消全选所有视频源
 * @param store 当前存储状态
 * @returns 新的存储状态
 */
export function deselectAllSources(store: SourceStore): SourceStore {
  return {
    ...store,
    sources: store.sources.map((s) => ({ ...s, isEnabled: false })),
  }
}

/**
 * 获取启用的视频源列表
 * @param store 当前存储状态
 * @returns 启用的视频源列表
 */
export function getEnabledSources(store: SourceStore): VideoSource[] {
  return store.sources.filter((s) => s.isEnabled)
}

/**
 * 获取视频源
 * @param store 当前存储状态
 * @param id 视频源ID
 * @returns 视频源或undefined
 */
export function getSource(store: SourceStore, id: string): VideoSource | undefined {
  return store.sources.find((s) => s.id === id)
}

/**
 * 重置视频源列表
 * @param initialSources 可选的初始视频源列表
 * @returns 新的存储状态
 */
export function resetSources(initialSources: VideoSource[] = []): SourceStore {
  return {
    ...createEmptySourceStore(),
    sources: initialSources.map((s) => ({ ...s, updatedAt: new Date() })),
  }
}
