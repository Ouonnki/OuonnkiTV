import type { VideoSource } from '@ouonnki/cms-core'
import { useFavoritesStore } from '@/features/favorites/store/favoritesStore'
import { useThemeStore } from '@/shared/components/theme'
import {
  filterNonSensitiveSettingsFieldUpdatedAt,
  inferVideoSourceOrigin,
  isManualVideoSource,
} from '@/shared/lib'
import { useApiStore } from '@/shared/store/apiStore'
import { useSearchStore } from '@/shared/store/searchStore'
import { useSettingStore } from '@/shared/store/settingStore'
import {
  fetchSourcesFromUrl,
  mapToSubscriptionSources,
  useSubscriptionStore,
} from '@/shared/store/subscriptionStore'
import { useViewingHistoryStore } from '@/shared/store/viewingHistoryStore'
import type { SyncSnapshot, SyncSubscriptionRecord, SyncVideoSourceRecord } from '../types'

const toIsoString = (value: Date | string | number | null | undefined): string => {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'number') return new Date(value).toISOString()
  if (typeof value === 'string') return new Date(value).toISOString()
  return new Date().toISOString()
}

const deserializeManualSource = (source: SyncVideoSourceRecord): VideoSource => {
  return {
    ...source,
    syncOrigin: 'manual',
    updatedAt: new Date(source.updatedAt),
  }
}

const deserializeSubscription = (
  subscription: SyncSubscriptionRecord,
): ReturnType<typeof buildSubscriptionState> => {
  return buildSubscriptionState(subscription)
}

const buildSubscriptionState = (subscription: SyncSubscriptionRecord) => {
  return {
    id: subscription.id,
    name: subscription.name,
    url: subscription.url,
    sourceCount: 0,
    lastRefreshedAt: null,
    lastRefreshSuccess: false,
    lastRefreshError: null,
    refreshInterval: subscription.refreshInterval,
    createdAt: new Date(subscription.createdAt),
    updatedAt: new Date(subscription.updatedAt),
  }
}

export const collectLocalSyncSnapshot = (): SyncSnapshot => {
  const favoriteState = useFavoritesStore.getState()
  const historyState = useViewingHistoryStore.getState()
  const searchState = useSearchStore.getState()
  const themeState = useThemeStore.getState()
  const settingsState = useSettingStore.getState()
  const apiState = useApiStore.getState()
  const subscriptionState = useSubscriptionStore.getState()

  const manualVideoSources = apiState.videoAPIs
    .filter(source => isManualVideoSource(source) || inferVideoSourceOrigin(source.id) === 'manual')
    .map<SyncVideoSourceRecord>(source => ({
      id: source.id,
      name: source.name,
      url: source.url,
      detailUrl: source.detailUrl,
      timeout: source.timeout,
      retry: source.retry,
      isEnabled: source.isEnabled,
      syncOrigin: 'manual',
      sortIndex: source.sortIndex ?? 0,
      updatedAt: toIsoString(source.updatedAt),
    }))
    .sort((left, right) => left.sortIndex - right.sortIndex)

  const subscriptions = subscriptionState.subscriptions
    .map<SyncSubscriptionRecord>(subscription => ({
      id: subscription.id,
      name: subscription.name,
      url: subscription.url,
      refreshInterval: subscription.refreshInterval,
      createdAt: toIsoString(subscription.createdAt),
      updatedAt: toIsoString(subscription.updatedAt),
    }))
    .sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt))

  return {
    favorites: favoriteState.favorites,
    viewingHistory: historyState.viewingHistory,
    searchHistory: searchState.searchHistory,
    theme: {
      mode: themeState.mode,
      updatedAt: themeState.modeUpdatedAt,
    },
    settings: {
      network: settingsState.network,
      search: settingsState.search,
      playback: settingsState.playback,
      system: {
        tmdbEnabled: settingsState.system.tmdbEnabled,
        tmdbApiBaseUrl: settingsState.system.tmdbApiBaseUrl,
        tmdbImageBaseUrl: settingsState.system.tmdbImageBaseUrl,
        isUpdateLogEnabled: settingsState.system.isUpdateLogEnabled,
        isScrollChromeAnimationEnabled: settingsState.system.isScrollChromeAnimationEnabled,
        tmdbLanguage: settingsState.system.tmdbLanguage,
        tmdbImageQuality: settingsState.system.tmdbImageQuality,
      },
      fieldUpdatedAt: filterNonSensitiveSettingsFieldUpdatedAt(
        settingsState.syncMeta.fieldUpdatedAt,
      ),
    },
    adFilteringEnabled: {
      value: apiState.adFilteringEnabled,
      updatedAt: apiState.adFilteringUpdatedAt,
    },
    videoSources: manualVideoSources,
    subscriptions,
  }
}

export const applySyncSnapshot = async (
  snapshot: SyncSnapshot,
  options: {
    setThemeMode: (mode: SyncSnapshot['theme']['mode']) => void
  },
): Promise<void> => {
  const currentToken = useSettingStore.getState().system.tmdbApiToken
  const currentQuery = useSearchStore.getState().query
  const currentEnvSources = useApiStore
    .getState()
    .videoAPIs.filter(source => (source.syncOrigin ?? inferVideoSourceOrigin(source.id)) === 'env')

  useFavoritesStore.setState({ favorites: snapshot.favorites })
  useFavoritesStore.getState()._applyFilters()
  useViewingHistoryStore.setState({ viewingHistory: snapshot.viewingHistory })
  useSearchStore.setState({
    query: currentQuery,
    searchHistory: snapshot.searchHistory,
  })

  useThemeStore.setState({
    mode: snapshot.theme.mode,
    modeUpdatedAt: snapshot.theme.updatedAt,
  })
  options.setThemeMode(snapshot.theme.mode)

  useSettingStore.setState({
    network: snapshot.settings.network,
    search: snapshot.settings.search,
    playback: snapshot.settings.playback,
    system: {
      ...snapshot.settings.system,
      tmdbApiToken: currentToken,
    },
    syncMeta: {
      fieldUpdatedAt: snapshot.settings.fieldUpdatedAt,
    },
  })

  useApiStore.setState({
    videoAPIs: [
      ...snapshot.videoSources
        .map(deserializeManualSource)
        .sort((left, right) => (left.sortIndex ?? 0) - (right.sortIndex ?? 0)),
      ...currentEnvSources,
    ],
    adFilteringEnabled: snapshot.adFilteringEnabled.value,
    adFilteringUpdatedAt: snapshot.adFilteringEnabled.updatedAt,
  })

  useSubscriptionStore.setState({
    subscriptions: snapshot.subscriptions.map(deserializeSubscription),
  })

  await rebuildSubscriptionSources()
}

export const rebuildSubscriptionSources = async (): Promise<void> => {
  const subscriptions = useSubscriptionStore.getState().subscriptions
  if (subscriptions.length === 0) {
    return
  }

  await Promise.allSettled(
    subscriptions.map(async subscription => {
      try {
        const rawSources = await fetchSourcesFromUrl(subscription.url)
        const sources = mapToSubscriptionSources(subscription.id, rawSources)
        useApiStore.getState().replaceSubscriptionSources(subscription.id, sources)

        useSubscriptionStore.setState(state => ({
          subscriptions: state.subscriptions.map(item =>
            item.id === subscription.id
              ? {
                  ...item,
                  sourceCount: sources.length,
                  lastRefreshedAt: new Date(),
                  lastRefreshSuccess: true,
                  lastRefreshError: null,
                }
              : item,
          ),
        }))
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        useSubscriptionStore.setState(state => ({
          subscriptions: state.subscriptions.map(item =>
            item.id === subscription.id
              ? {
                  ...item,
                  lastRefreshedAt: new Date(),
                  lastRefreshSuccess: false,
                  lastRefreshError: errorMessage,
                }
              : item,
          ),
        }))
      }
    }),
  )
}

export const clearSyncManagedLocalData = async (
  options: {
    setThemeMode: (mode: SyncSnapshot['theme']['mode']) => void
  },
): Promise<void> => {
  const currentToken = useSettingStore.getState().system.tmdbApiToken

  useFavoritesStore.setState({ favorites: [] })
  useFavoritesStore.getState()._applyFilters()
  useViewingHistoryStore.setState({ viewingHistory: [] })
  useSearchStore.setState({ query: '', searchHistory: [] })
  useThemeStore.getState().resetTheme()
  options.setThemeMode('system')

  useSettingStore.getState().resetSettings()
  if (currentToken) {
    useSettingStore.getState().setSystemSettings({ tmdbApiToken: currentToken })
  }

  useSubscriptionStore.setState({ subscriptions: [] })
  useApiStore.setState({
    adFilteringEnabled: true,
    adFilteringUpdatedAt: Date.now(),
    videoAPIs: [],
  })
  await useApiStore.getState().initializeEnvSources()
}
