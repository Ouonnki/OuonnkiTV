import { beforeEach, describe, expect, it } from 'vitest'
import type { ViewingHistoryItem } from '@/shared/types'
import { useViewingHistoryStore } from './viewingHistoryStore'

function createHistoryItem(
  overrides: Partial<ViewingHistoryItem> = {},
  episodeIndex = 0,
): ViewingHistoryItem {
  return {
    recordType: 'cms',
    title: '测试视频',
    imageUrl: 'https://example.com/poster.jpg',
    episodeIndex,
    episodeName: `第${episodeIndex + 1}集`,
    sourceCode: 'test-source',
    sourceName: '测试源',
    vodId: 'vod-1',
    timestamp: Date.now(),
    playbackPosition: 120,
    duration: 240,
    ...overrides,
  }
}

function createTmdbHistoryItem(
  overrides: Partial<ViewingHistoryItem> = {},
  episodeIndex = 0,
): ViewingHistoryItem {
  return {
    ...createHistoryItem({}, episodeIndex),
    recordType: 'tmdb',
    tmdbMediaType: 'tv',
    tmdbId: 9527,
    tmdbSeasonNumber: 1,
    ...overrides,
  }
}

describe('viewingHistoryStore', () => {
  beforeEach(() => {
    localStorage.removeItem('ouonnki-tv-viewing-history')
    useViewingHistoryStore.setState({ viewingHistory: [] })
  })

  it('removeViewingHistory 会删除同一视频的全部分集记录', () => {
    const target = createHistoryItem({}, 0)
    const secondEpisode = createHistoryItem({}, 1)
    const otherVideo = createHistoryItem({ vodId: 'vod-2' }, 0)

    useViewingHistoryStore.setState({
      viewingHistory: [target, secondEpisode, otherVideo],
    })

    useViewingHistoryStore.getState().removeViewingHistory(target)

    const remaining = useViewingHistoryStore.getState().viewingHistory
    expect(remaining).toHaveLength(1)
    expect(remaining[0]?.vodId).toBe('vod-2')
  })

  it('removeViewingHistoryItem 仅删除指定分集记录', () => {
    const target = createHistoryItem({}, 0)
    const secondEpisode = createHistoryItem({}, 1)
    const otherVideo = createHistoryItem({ vodId: 'vod-2' }, 0)

    useViewingHistoryStore.setState({
      viewingHistory: [target, secondEpisode, otherVideo],
    })

    useViewingHistoryStore.getState().removeViewingHistoryItem(target)

    const remaining = useViewingHistoryStore.getState().viewingHistory
    expect(remaining).toHaveLength(2)
    expect(remaining.some(item => item.vodId === 'vod-1' && item.episodeIndex === 1)).toBe(true)
    expect(remaining.some(item => item.vodId === 'vod-2')).toBe(true)
  })

  it('tmdb 同剧同季同集会覆盖，不新增条目', () => {
    const first = createTmdbHistoryItem({ playbackPosition: 60 }, 2)
    const second = createTmdbHistoryItem(
      {
        playbackPosition: 180,
        sourceCode: 'another-source',
        vodId: 'another-vod',
      },
      2,
    )

    useViewingHistoryStore.getState().addViewingHistory(first)
    useViewingHistoryStore.getState().addViewingHistory(second)

    const history = useViewingHistoryStore.getState().viewingHistory
    expect(history).toHaveLength(1)
    expect(history[0]?.recordType).toBe('tmdb')
    expect(history[0]?.playbackPosition).toBe(180)
    expect(history[0]?.sourceCode).toBe('another-source')
    expect(history[0]?.vodId).toBe('another-vod')
  })

  it('tmdb 同剧不同季同集会保留两条记录', () => {
    const seasonOne = createTmdbHistoryItem({ tmdbSeasonNumber: 1 }, 3)
    const seasonTwo = createTmdbHistoryItem({ tmdbSeasonNumber: 2 }, 3)

    useViewingHistoryStore.getState().addViewingHistory(seasonOne)
    useViewingHistoryStore.getState().addViewingHistory(seasonTwo)

    const history = useViewingHistoryStore.getState().viewingHistory
    expect(history).toHaveLength(2)
    expect(history.some(item => item.tmdbSeasonNumber === 1)).toBe(true)
    expect(history.some(item => item.tmdbSeasonNumber === 2)).toBe(true)
  })

  it('tmdb removeViewingHistory 会删除同 tmdbId + mediaType 的全部记录', () => {
    const target = createTmdbHistoryItem({ tmdbSeasonNumber: 1 }, 0)
    const sameTmdbAnotherSeason = createTmdbHistoryItem({ tmdbSeasonNumber: 2 }, 1)
    const otherTmdb = createTmdbHistoryItem({ tmdbId: 10086, tmdbSeasonNumber: 1 }, 0)

    useViewingHistoryStore.setState({
      viewingHistory: [target, sameTmdbAnotherSeason, otherTmdb],
    })

    useViewingHistoryStore.getState().removeViewingHistory(target)

    const remaining = useViewingHistoryStore.getState().viewingHistory
    expect(remaining).toHaveLength(1)
    expect(remaining[0]?.tmdbId).toBe(10086)
  })

  it('迁移旧数据时会补齐 recordType=cms', async () => {
    const migrate = useViewingHistoryStore.persist.getOptions().migrate
    const legacyState = {
      viewingHistory: [
        {
          title: '旧记录',
          imageUrl: '',
          episodeIndex: 0,
          sourceCode: 'legacy-source',
          sourceName: '旧源',
          vodId: 'legacy-vod',
          timestamp: 1,
          playbackPosition: 1,
          duration: 10,
        },
      ],
    }

    const migratedState = (await Promise.resolve(migrate?.(legacyState, 2.1))) as {
      viewingHistory: ViewingHistoryItem[]
    }

    expect(migratedState.viewingHistory[0]?.recordType).toBe('cms')
  })
})
