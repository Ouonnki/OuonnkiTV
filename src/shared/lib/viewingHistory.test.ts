import { describe, expect, it } from 'vitest'
import type { ViewingHistoryItem } from '@/shared/types'
import {
  buildHistoryPlayPath,
  getHistoryItemKey,
  getHistorySeriesKey,
  isTmdbHistoryItem,
} from './viewingHistory'

function createCmsHistoryItem(overrides: Partial<ViewingHistoryItem> = {}): ViewingHistoryItem {
  return {
    recordType: 'cms',
    title: 'CMS 视频',
    imageUrl: '',
    episodeIndex: 1,
    sourceCode: 'source-a',
    sourceName: '源 A',
    vodId: 'vod-a',
    timestamp: 1,
    playbackPosition: 30,
    duration: 100,
    ...overrides,
  }
}

function createTmdbHistoryItem(overrides: Partial<ViewingHistoryItem> = {}): ViewingHistoryItem {
  return {
    ...createCmsHistoryItem(overrides),
    recordType: 'tmdb',
    tmdbMediaType: 'tv',
    tmdbId: 9527,
    tmdbSeasonNumber: 2,
  }
}

describe('viewingHistory helpers', () => {
  it('buildHistoryPlayPath 对 cms 与 tmdb 产出正确路径', () => {
    const cmsPath = buildHistoryPlayPath(createCmsHistoryItem())
    const tmdbPath = buildHistoryPlayPath(createTmdbHistoryItem())

    expect(cmsPath).toBe('/play/cms/source-a/vod-a?ep=1')
    expect(tmdbPath).toBe('/play/tv/9527?source=source-a&id=vod-a&ep=1&season=2')
  })

  it('getHistoryItemKey 与 getHistorySeriesKey 在 cms/tmdb 下互不冲突', () => {
    const cmsItem = createCmsHistoryItem()
    const tmdbItem = createTmdbHistoryItem({ episodeIndex: 1 })

    expect(getHistoryItemKey(cmsItem)).toBe('cms::source-a::vod-a::1')
    expect(getHistorySeriesKey(cmsItem)).toBe('cms::source-a::vod-a')

    expect(getHistoryItemKey(tmdbItem)).toBe('tmdb::tv::9527::2::1')
    expect(getHistorySeriesKey(tmdbItem)).toBe('tmdb::tv::9527')
  })

  it('isTmdbHistoryItem 能正确识别 tmdb 条目', () => {
    expect(isTmdbHistoryItem(createTmdbHistoryItem())).toBe(true)
    expect(isTmdbHistoryItem(createCmsHistoryItem())).toBe(false)
  })
})
