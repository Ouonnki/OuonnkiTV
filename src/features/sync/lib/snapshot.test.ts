import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FavoriteWatchStatus } from '@/features/favorites/types/favorites'
import { useFavoritesStore } from '@/features/favorites/store/favoritesStore'
import { useThemeStore } from '@/shared/components/theme'
import { useApiStore } from '@/shared/store/apiStore'
import { useSearchStore } from '@/shared/store/searchStore'
import { useSettingStore } from '@/shared/store/settingStore'
import { useSubscriptionStore } from '@/shared/store/subscriptionStore'
import { useViewingHistoryStore } from '@/shared/store/viewingHistoryStore'
import type { SyncSnapshot } from '../types'
import { applySyncSnapshot, collectLocalSyncSnapshot } from './snapshot'

const buildSnapshot = (): SyncSnapshot => ({
  favorites: [],
  viewingHistory: [],
  searchHistory: [],
  theme: {
    mode: 'dark',
    updatedAt: 20,
  },
  settings: {
    network: {
      defaultTimeout: 5000,
      defaultRetry: 2,
      concurrencyLimit: 4,
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
      defaultVolume: 0.6,
      playerThemeColor: '#000000',
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
      tmdbEnabled: true,
      tmdbApiBaseUrl: 'https://api.themoviedb.org/3',
      tmdbImageBaseUrl: 'https://image.tmdb.org/t/p/',
      isUpdateLogEnabled: false,
      isScrollChromeAnimationEnabled: false,
      tmdbLanguage: 'zh-CN',
      tmdbImageQuality: 'medium',
    },
    fieldUpdatedAt: {
      'network.defaultTimeout': 10,
      'system.tmdbEnabled': 20,
    },
  },
  adFilteringEnabled: {
    value: false,
    updatedAt: 15,
  },
  videoSources: [
    {
      id: 'manual-a',
      name: 'Manual A',
      url: 'https://manual.example.com',
      detailUrl: 'https://manual.example.com/detail',
      isEnabled: true,
      syncOrigin: 'manual',
      sortIndex: 0,
      updatedAt: new Date('2026-04-27T10:00:00.000Z').toISOString(),
    },
  ],
  subscriptions: [
    {
      id: 'sub-1',
      name: 'Remote Subscription',
      url: 'https://remote.example.com/subscription.json',
      refreshInterval: 60,
      createdAt: new Date('2026-04-27T09:00:00.000Z').toISOString(),
      updatedAt: new Date('2026-04-27T09:30:00.000Z').toISOString(),
    },
  ],
})

describe('sync snapshot helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    useFavoritesStore.setState({
      favorites: [],
      filterOptions: {
        sourceType: 'all',
        watchStatus: 'all',
        sortBy: 'addedAt',
        sortOrder: 'desc',
      },
      filteredFavorites: [],
      selectedIds: new Set<string>(),
    })
    useViewingHistoryStore.setState({ viewingHistory: [] })
    useSearchStore.setState({ query: '', searchHistory: [] })
    useThemeStore.setState({ mode: 'system', modeUpdatedAt: 1 })
    useSettingStore.setState(state => ({
      ...state,
      system: {
        ...state.system,
        tmdbApiToken: '',
      },
      syncMeta: {
        fieldUpdatedAt: {
          'system.tmdbApiToken': 999,
          'network.defaultTimeout': 111,
        },
      },
    }))
    useApiStore.setState({
      videoAPIs: [],
      adFilteringEnabled: true,
      adFilteringUpdatedAt: 1,
    })
    useSubscriptionStore.setState({ subscriptions: [] })
  })

  it('collects a sanitized sync snapshot', () => {
    useFavoritesStore.setState({
      favorites: [
        {
          id: 'fav-1',
          sourceType: 'tmdb',
          addedAt: 1,
          updatedAt: 2,
          watchStatus: FavoriteWatchStatus.NOT_WATCHED,
          tags: [],
          media: {
            id: 1,
            mediaType: 'movie',
            title: 'Movie',
            originalTitle: 'Movie',
            posterPath: null,
            backdropPath: null,
            releaseDate: '2024-01-01',
            voteAverage: 8,
          },
        },
      ],
    })
    useSettingStore.setState(state => ({
      ...state,
      system: {
        ...state.system,
        tmdbApiToken: 'super-secret-token',
      },
      syncMeta: {
        fieldUpdatedAt: {
          ...state.syncMeta.fieldUpdatedAt,
          'network.defaultTimeout': 123,
          'system.tmdbApiToken': 999,
        },
      },
    }))
    useApiStore.setState({
      videoAPIs: [
        {
          id: 'env_source_0',
          name: 'Env Source',
          url: 'https://env.example.com',
          detailUrl: 'https://env.example.com/detail',
          isEnabled: true,
          syncOrigin: 'env',
          sortIndex: 0,
          updatedAt: new Date('2026-04-27T08:00:00.000Z'),
        },
        {
          id: 'manual-1',
          name: 'Manual Source',
          url: 'https://manual.example.com',
          detailUrl: 'https://manual.example.com/detail',
          isEnabled: true,
          syncOrigin: 'manual',
          sortIndex: 1,
          updatedAt: new Date('2026-04-27T09:00:00.000Z'),
        },
      ],
      adFilteringEnabled: false,
      adFilteringUpdatedAt: 321,
    })
    useSubscriptionStore.setState({
      subscriptions: [
        {
          id: 'sub-1',
          name: 'Subscription One',
          url: 'https://sub.example.com',
          sourceCount: 3,
          lastRefreshedAt: new Date('2026-04-27T10:00:00.000Z'),
          lastRefreshSuccess: true,
          lastRefreshError: null,
          refreshInterval: 60,
          createdAt: new Date('2026-04-27T08:00:00.000Z'),
          updatedAt: new Date('2026-04-27T09:00:00.000Z'),
        },
      ],
    })

    const snapshot = collectLocalSyncSnapshot()

    expect(snapshot.settings.system).not.toHaveProperty('tmdbApiToken')
    expect(snapshot.settings.fieldUpdatedAt).not.toHaveProperty('system.tmdbApiToken')
    expect(snapshot.videoSources).toHaveLength(1)
    expect(snapshot.videoSources[0]?.id).toBe('manual-1')
    expect(snapshot.subscriptions[0]).toEqual(
      expect.objectContaining({
        id: 'sub-1',
        name: 'Subscription One',
        url: 'https://sub.example.com',
        refreshInterval: 60,
      }),
    )
  })

  it('applies remote snapshot and preserves local secret token while rebuilding subscriptions', async () => {
    useSettingStore.setState(state => ({
      ...state,
      system: {
        ...state.system,
        tmdbApiToken: 'local-only-token',
      },
    }))

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            name: 'Subscription Source',
            url: 'https://source.example.com',
          },
        ],
      }),
    )

    const snapshot = buildSnapshot()
    await applySyncSnapshot(snapshot, {
      setThemeMode: () => undefined,
    })

    expect(useSettingStore.getState().system.tmdbApiToken).toBe('local-only-token')
    expect(useThemeStore.getState().mode).toBe('dark')
    expect(useSubscriptionStore.getState().subscriptions).toHaveLength(1)
    expect(useApiStore.getState().videoAPIs.some(source => source.id.startsWith('sub:sub-1:'))).toBe(
      true,
    )
  })
})
