import { describe, expect, it } from 'vitest'
import { FavoriteWatchStatus } from '@/features/favorites/types/favorites'
import type { SyncSnapshot } from '../types'
import { mergeSyncSnapshots } from './merge'

const buildSnapshot = (): SyncSnapshot => ({
  favorites: [],
  viewingHistory: [],
  searchHistory: [],
  theme: {
    mode: 'system',
    updatedAt: 1,
  },
  settings: {
    network: {
      defaultTimeout: 3000,
      defaultRetry: 3,
      concurrencyLimit: 3,
      isProxyEnabled: true,
      proxyUrl: '/proxy?url=',
    },
    search: {
      isSearchHistoryEnabled: true,
      isSearchHistoryVisible: true,
      maxSearchHistoryCount: 20,
    },
    playback: {
      isViewingHistoryEnabled: true,
      isViewingHistoryVisible: true,
      isAutoPlayEnabled: false,
      defaultEpisodeOrder: 'asc',
      defaultVolume: 0.7,
      playerThemeColor: '#ef4444',
      maxViewingHistoryCount: 50,
      tmdbMatchCacheTTLHours: 24,
      isLoopEnabled: false,
      isPipEnabled: true,
      isAutoMiniEnabled: true,
      isScreenshotEnabled: true,
      isMobileGestureEnabled: true,
      longPressPlaybackRate: 2,
      isFullscreenProgressHidden: false,
    },
    system: {
      tmdbEnabled: false,
      tmdbApiBaseUrl: 'https://api.themoviedb.org/3',
      tmdbImageBaseUrl: 'https://image.tmdb.org/t/p/',
      isUpdateLogEnabled: false,
      isScrollChromeAnimationEnabled: false,
      tmdbLanguage: 'zh-CN',
      tmdbImageQuality: 'medium',
    },
    fieldUpdatedAt: {
      'network.defaultTimeout': 1,
      'playback.defaultVolume': 1,
    },
  },
  adFilteringEnabled: {
    value: true,
    updatedAt: 1,
  },
  videoSources: [],
  subscriptions: [],
})

describe('mergeSyncSnapshots', () => {
  it('merges settings by field timestamp', () => {
    const current = buildSnapshot()
    const incoming = buildSnapshot()

    current.settings.network.defaultTimeout = 3000
    current.settings.fieldUpdatedAt['network.defaultTimeout'] = 10
    incoming.settings.network.defaultTimeout = 5000
    incoming.settings.fieldUpdatedAt['network.defaultTimeout'] = 20

    current.settings.playback.defaultVolume = 0.4
    current.settings.fieldUpdatedAt['playback.defaultVolume'] = 50
    incoming.settings.playback.defaultVolume = 0.8
    incoming.settings.fieldUpdatedAt['playback.defaultVolume'] = 30

    const merged = mergeSyncSnapshots(current, incoming)

    expect(merged.settings.network.defaultTimeout).toBe(5000)
    expect(merged.settings.playback.defaultVolume).toBe(0.4)
  })

  it('merges lists by stable key and keeps latest record', () => {
    const current = buildSnapshot()
    const incoming = buildSnapshot()

    current.favorites = [
      {
        id: 'fav-a',
        sourceType: 'tmdb',
        addedAt: 1,
        updatedAt: 10,
        watchStatus: FavoriteWatchStatus.NOT_WATCHED,
        tags: [],
        media: {
          id: 1,
          mediaType: 'movie',
          title: 'A',
          originalTitle: 'A',
          posterPath: null,
          backdropPath: null,
          releaseDate: '2024-01-01',
          voteAverage: 7,
        },
      },
    ]
    incoming.favorites = [
      {
        id: 'fav-a',
        sourceType: 'tmdb',
        addedAt: 1,
        updatedAt: 20,
        watchStatus: FavoriteWatchStatus.COMPLETED,
        tags: ['done'],
        media: {
          id: 1,
          mediaType: 'movie',
          title: 'A',
          originalTitle: 'A',
          posterPath: null,
          backdropPath: null,
          releaseDate: '2024-01-01',
          voteAverage: 7,
        },
      },
      {
        id: 'fav-b',
        sourceType: 'tmdb',
        addedAt: 2,
        updatedAt: 2,
        watchStatus: FavoriteWatchStatus.WATCHING,
        tags: [],
        media: {
          id: 2,
          mediaType: 'movie',
          title: 'B',
          originalTitle: 'B',
          posterPath: null,
          backdropPath: null,
          releaseDate: '2024-01-02',
          voteAverage: 8,
        },
      },
    ]

    const merged = mergeSyncSnapshots(current, incoming)

    expect(merged.favorites).toHaveLength(2)
    expect(merged.favorites.find(item => item.id === 'fav-a')?.watchStatus).toBe('completed')
    expect(merged.favorites[0]?.id).toBe('fav-b')
  })
})
