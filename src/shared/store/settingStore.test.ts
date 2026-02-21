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
})
