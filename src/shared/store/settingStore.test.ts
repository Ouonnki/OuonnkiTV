import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/shared/config/settings.config'
import { useSettingStore } from './settingStore'

describe('settingStore migrate', () => {
  it('v5 -> v6 会补齐 tmdbMatchCacheTTLHours 默认值', async () => {
    const migrate = useSettingStore.persist.getOptions().migrate

    const legacyState = {
      network: DEFAULT_SETTINGS.network,
      search: DEFAULT_SETTINGS.search,
      playback: {
        ...DEFAULT_SETTINGS.playback,
      },
      system: DEFAULT_SETTINGS.system,
    }
    delete (legacyState.playback as Record<string, unknown>).tmdbMatchCacheTTLHours

    const migrated = (await Promise.resolve(migrate?.(legacyState, 5))) as {
      playback: { tmdbMatchCacheTTLHours?: number }
    }

    expect(migrated.playback.tmdbMatchCacheTTLHours).toBe(24)
  })

  it('已有 tmdbMatchCacheTTLHours 时不覆盖', async () => {
    const migrate = useSettingStore.persist.getOptions().migrate

    const legacyState = {
      network: DEFAULT_SETTINGS.network,
      search: DEFAULT_SETTINGS.search,
      playback: {
        ...DEFAULT_SETTINGS.playback,
        tmdbMatchCacheTTLHours: 72,
      },
      system: DEFAULT_SETTINGS.system,
    }

    const migrated = (await Promise.resolve(migrate?.(legacyState, 5))) as {
      playback: { tmdbMatchCacheTTLHours?: number }
    }

    expect(migrated.playback.tmdbMatchCacheTTLHours).toBe(72)
  })

  it('v6 -> v7 会补齐 isMobileGestureEnabled 默认值', async () => {
    const migrate = useSettingStore.persist.getOptions().migrate

    const legacyState = {
      network: DEFAULT_SETTINGS.network,
      search: DEFAULT_SETTINGS.search,
      playback: {
        ...DEFAULT_SETTINGS.playback,
      },
      system: DEFAULT_SETTINGS.system,
    }
    delete (legacyState.playback as Record<string, unknown>).isMobileGestureEnabled

    const migrated = (await Promise.resolve(migrate?.(legacyState, 6))) as {
      playback: { isMobileGestureEnabled?: boolean }
    }

    expect(migrated.playback.isMobileGestureEnabled).toBe(true)
  })

  it('已有 isMobileGestureEnabled 时不覆盖', async () => {
    const migrate = useSettingStore.persist.getOptions().migrate

    const legacyState = {
      network: DEFAULT_SETTINGS.network,
      search: DEFAULT_SETTINGS.search,
      playback: {
        ...DEFAULT_SETTINGS.playback,
        isMobileGestureEnabled: false,
      },
      system: DEFAULT_SETTINGS.system,
    }

    const migrated = (await Promise.resolve(migrate?.(legacyState, 6))) as {
      playback: { isMobileGestureEnabled?: boolean }
    }

    expect(migrated.playback.isMobileGestureEnabled).toBe(false)
  })

  it('v9 -> v10 会补齐 tmdbApiBaseUrl 与 tmdbImageBaseUrl 默认值', async () => {
    const migrate = useSettingStore.persist.getOptions().migrate

    const legacyState = {
      network: DEFAULT_SETTINGS.network,
      search: DEFAULT_SETTINGS.search,
      playback: {
        ...DEFAULT_SETTINGS.playback,
      },
      system: {
        ...DEFAULT_SETTINGS.system,
      },
    }
    delete (legacyState.system as Record<string, unknown>).tmdbApiBaseUrl
    delete (legacyState.system as Record<string, unknown>).tmdbImageBaseUrl

    const migrated = (await Promise.resolve(migrate?.(legacyState, 9))) as {
      system: { tmdbApiBaseUrl?: string; tmdbImageBaseUrl?: string }
    }

    expect(migrated.system.tmdbApiBaseUrl).toBe(DEFAULT_SETTINGS.system.tmdbApiBaseUrl)
    expect(migrated.system.tmdbImageBaseUrl).toBe(DEFAULT_SETTINGS.system.tmdbImageBaseUrl)
  })

  it('已有 tmdbApiBaseUrl 与 tmdbImageBaseUrl 时不覆盖', async () => {
    const migrate = useSettingStore.persist.getOptions().migrate

    const legacyState = {
      network: DEFAULT_SETTINGS.network,
      search: DEFAULT_SETTINGS.search,
      playback: {
        ...DEFAULT_SETTINGS.playback,
      },
      system: {
        ...DEFAULT_SETTINGS.system,
        tmdbApiBaseUrl: '/custom-api',
        tmdbImageBaseUrl: '/custom-image',
      },
    }

    const migrated = (await Promise.resolve(migrate?.(legacyState, 9))) as {
      system: { tmdbApiBaseUrl?: string; tmdbImageBaseUrl?: string }
    }

    expect(migrated.system.tmdbApiBaseUrl).toBe('/custom-api')
    expect(migrated.system.tmdbImageBaseUrl).toBe('/custom-image')
  })

  it('v10 -> v11 会补齐 isScrollChromeAnimationEnabled 默认值', async () => {
    const migrate = useSettingStore.persist.getOptions().migrate

    const legacyState = {
      network: DEFAULT_SETTINGS.network,
      search: DEFAULT_SETTINGS.search,
      playback: {
        ...DEFAULT_SETTINGS.playback,
      },
      system: {
        ...DEFAULT_SETTINGS.system,
      },
    }
    delete (legacyState.system as Record<string, unknown>).isScrollChromeAnimationEnabled

    const migrated = (await Promise.resolve(migrate?.(legacyState, 10))) as {
      system: { isScrollChromeAnimationEnabled?: boolean }
    }

    expect(migrated.system.isScrollChromeAnimationEnabled).toBe(false)
  })

  it('已有 isScrollChromeAnimationEnabled 时不覆盖', async () => {
    const migrate = useSettingStore.persist.getOptions().migrate

    const legacyState = {
      network: DEFAULT_SETTINGS.network,
      search: DEFAULT_SETTINGS.search,
      playback: {
        ...DEFAULT_SETTINGS.playback,
      },
      system: {
        ...DEFAULT_SETTINGS.system,
        isScrollChromeAnimationEnabled: true,
      },
    }

    const migrated = (await Promise.resolve(migrate?.(legacyState, 10))) as {
      system: { isScrollChromeAnimationEnabled?: boolean }
    }

    expect(migrated.system.isScrollChromeAnimationEnabled).toBe(true)
  })

  it('v11 -> v12 会补齐 longPressPlaybackRate 默认值', async () => {
    const migrate = useSettingStore.persist.getOptions().migrate

    const legacyState = {
      network: DEFAULT_SETTINGS.network,
      search: DEFAULT_SETTINGS.search,
      playback: {
        ...DEFAULT_SETTINGS.playback,
      },
      system: DEFAULT_SETTINGS.system,
    }
    delete (legacyState.playback as Record<string, unknown>).longPressPlaybackRate

    const migrated = (await Promise.resolve(migrate?.(legacyState, 11))) as {
      playback: { longPressPlaybackRate?: number }
    }

    expect(migrated.playback.longPressPlaybackRate).toBe(DEFAULT_SETTINGS.playback.longPressPlaybackRate)
  })

  it('已有 longPressPlaybackRate 时不覆盖', async () => {
    const migrate = useSettingStore.persist.getOptions().migrate

    const legacyState = {
      network: DEFAULT_SETTINGS.network,
      search: DEFAULT_SETTINGS.search,
      playback: {
        ...DEFAULT_SETTINGS.playback,
        longPressPlaybackRate: 3.5,
      },
      system: DEFAULT_SETTINGS.system,
    }

    const migrated = (await Promise.resolve(migrate?.(legacyState, 11))) as {
      playback: { longPressPlaybackRate?: number }
    }

    expect(migrated.playback.longPressPlaybackRate).toBe(3.5)
  })
})
