import { beforeEach, describe, expect, it } from 'vitest'
import type { VideoItem } from '@/shared/types/video'
import { useFavoritesStore } from './favoritesStore'

const DEFAULT_FILTER_OPTIONS = {
  sourceType: 'all',
  watchStatus: 'all',
  sortBy: 'addedAt',
  sortOrder: 'desc',
} as const

function createCmsVideo(overrides: Partial<VideoItem> = {}): VideoItem {
  return {
    vod_id: 'vod-1',
    vod_name: '测试视频',
    source_code: 'source-a',
    source_name: '测试源',
    ...overrides,
  }
}

describe('favoritesStore cms id encoding', () => {
  beforeEach(() => {
    localStorage.removeItem('ouonnki-tv-favorites-store')
    useFavoritesStore.persist.clearStorage()
    useFavoritesStore.setState({
      favorites: [],
      filteredFavorites: [],
      filterOptions: { ...DEFAULT_FILTER_OPTIONS },
      selectedIds: new Set<string>(),
    })
  })

  it('addCmsFavorite 支持中文 sourceCode 和 vodId', () => {
    const video = createCmsVideo({
      vod_id: '第壹集-中文ID',
      source_code: '源站A-中文',
    })

    expect(() => useFavoritesStore.getState().addCmsFavorite(video)).not.toThrow()
    expect(useFavoritesStore.getState().isCmsFavorited(video.vod_id, video.source_code || '')).toBe(true)

    const favorite = useFavoritesStore.getState().getCmsFavorite(video.vod_id, video.source_code || '')
    expect(favorite).toBeDefined()
    expect(favorite?.media.vodId).toBe(video.vod_id)
    expect(favorite?.media.sourceCode).toBe(video.source_code)
  })

  it('toggleCmsFavorite 在中文 ID 下可正确添加与移除', () => {
    const video = createCmsVideo({
      vod_id: '中文-可切换',
      source_code: '直连-中文源',
    })

    useFavoritesStore.getState().toggleCmsFavorite(video)
    expect(useFavoritesStore.getState().favorites).toHaveLength(1)
    expect(useFavoritesStore.getState().isCmsFavorited(video.vod_id, video.source_code || '')).toBe(true)

    useFavoritesStore.getState().toggleCmsFavorite(video)
    expect(useFavoritesStore.getState().favorites).toHaveLength(0)
    expect(useFavoritesStore.getState().isCmsFavorited(video.vod_id, video.source_code || '')).toBe(false)
  })

  it('ASCII 输入与旧 btoa 结果保持一致', () => {
    const sourceCode = 'source-en'
    const vodId = 'vod-abc-123'
    const video = createCmsVideo({
      vod_id: vodId,
      source_code: sourceCode,
    })

    useFavoritesStore.getState().addCmsFavorite(video)
    const favorite = useFavoritesStore.getState().favorites[0]
    const legacyId = `cms_${btoa(`${sourceCode}::${vodId}`)}`

    expect(favorite?.id).toBe(legacyId)
  })

  it('addFavorites 在中文 CMS 条目下可去重', () => {
    const video = createCmsVideo({
      vod_id: '中文-去重',
      source_code: '中文-源',
    })

    useFavoritesStore.getState().addFavorites([video, { ...video }])
    expect(useFavoritesStore.getState().favorites).toHaveLength(1)
  })
})
