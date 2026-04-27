import { z } from 'zod'

const favoriteSchema = z
  .object({
    id: z.string().min(1),
    addedAt: z.number().optional(),
    updatedAt: z.number().optional(),
  })
  .passthrough()

const viewingHistorySchema = z
  .object({
    recordType: z.enum(['cms', 'tmdb']),
    sourceCode: z.string(),
    vodId: z.string(),
    episodeIndex: z.number(),
    timestamp: z.number(),
    tmdbMediaType: z.enum(['movie', 'tv']).optional(),
    tmdbId: z.number().optional(),
    tmdbSeasonNumber: z.number().nullable().optional(),
  })
  .passthrough()

const searchHistorySchema = z
  .object({
    id: z.string().min(1),
    content: z.string().min(1),
    createdAt: z.number(),
    updatedAt: z.number(),
  })
  .passthrough()

const themeSchema = z.object({
  mode: z.enum(['system', 'light', 'dark']),
  updatedAt: z.number(),
})

const networkSettingsSchema = z.object({
  defaultTimeout: z.number(),
  defaultRetry: z.number(),
  concurrencyLimit: z.number(),
  isProxyEnabled: z.boolean(),
  proxyUrl: z.string(),
})

const searchSettingsSchema = z.object({
  isSearchHistoryEnabled: z.boolean(),
  isSearchHistoryVisible: z.boolean(),
  maxSearchHistoryCount: z.number(),
})

const playbackSettingsSchema = z.object({
  isViewingHistoryEnabled: z.boolean(),
  isViewingHistoryVisible: z.boolean(),
  isAutoPlayEnabled: z.boolean(),
  defaultEpisodeOrder: z.enum(['asc', 'desc']),
  defaultVolume: z.number(),
  playerThemeColor: z.string(),
  maxViewingHistoryCount: z.number(),
  tmdbMatchCacheTTLHours: z.number(),
  isLoopEnabled: z.boolean(),
  isPipEnabled: z.boolean(),
  isAutoMiniEnabled: z.boolean(),
  isScreenshotEnabled: z.boolean(),
  isMobileGestureEnabled: z.boolean(),
  longPressPlaybackRate: z.number(),
  isFullscreenProgressHidden: z.boolean(),
})

const systemSettingsSchema = z.object({
  tmdbEnabled: z.boolean(),
  tmdbApiBaseUrl: z.string(),
  tmdbImageBaseUrl: z.string(),
  isUpdateLogEnabled: z.boolean(),
  isScrollChromeAnimationEnabled: z.boolean(),
  tmdbLanguage: z.string(),
  tmdbImageQuality: z.enum(['low', 'medium', 'high']),
})

const settingsSchema = z.object({
  network: networkSettingsSchema,
  search: searchSettingsSchema,
  playback: playbackSettingsSchema,
  system: systemSettingsSchema,
  fieldUpdatedAt: z.record(z.string(), z.number()),
})

const adFilteringSchema = z.object({
  value: z.boolean(),
  updatedAt: z.number(),
})

const videoSourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  url: z.string().min(1),
  detailUrl: z.string().optional(),
  timeout: z.number().optional(),
  retry: z.number().optional(),
  isEnabled: z.boolean(),
  syncOrigin: z.literal('manual'),
  sortIndex: z.number().int().nonnegative(),
  updatedAt: z.string(),
})

const subscriptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  url: z.string().min(1),
  refreshInterval: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const syncSnapshotSchema = z.object({
  favorites: z.array(favoriteSchema),
  viewingHistory: z.array(viewingHistorySchema),
  searchHistory: z.array(searchHistorySchema),
  theme: themeSchema,
  settings: settingsSchema,
  adFilteringEnabled: adFilteringSchema,
  videoSources: z.array(videoSourceSchema),
  subscriptions: z.array(subscriptionSchema),
})

export const syncStateUpdateRequestSchema = z.object({
  revision: z.number().int().min(0),
  snapshot: syncSnapshotSchema,
})

export const authCredentialsSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(/^\S+$/, 'Username must not contain whitespace'),
  password: z.string().min(8).max(128),
})

export function createEmptySyncSnapshot(timestamp = Date.now()) {
  return {
    favorites: [],
    viewingHistory: [],
    searchHistory: [],
    theme: {
      mode: 'system',
      updatedAt: timestamp,
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
      fieldUpdatedAt: {},
    },
    adFilteringEnabled: {
      value: true,
      updatedAt: timestamp,
    },
    videoSources: [],
    subscriptions: [],
  }
}
