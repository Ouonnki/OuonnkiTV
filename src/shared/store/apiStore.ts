import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { VideoSource, SourceStore } from '@ouonnki/cms-core'
import {
  addSource,
  deselectAllSources,
  getEnabledSources,
  importSources,
  removeSource,
  selectAllSources,
  setSourceEnabled,
} from '@ouonnki/cms-core/source'
import { v4 as uuidv4 } from 'uuid'
import { getInitialVideoSources } from '@/shared/config/api.config'
import { DEFAULT_SETTINGS } from '@/shared/config/settings.config'
import { normalizeVideoSource } from '@/shared/lib'
import { useSettingStore } from './settingStore'

export type VideoApi = VideoSource

interface ApiState {
  videoAPIs: VideoSource[]
  adFilteringEnabled: boolean
  adFilteringUpdatedAt: number
}

interface ApiActions {
  setApiEnabled: (apiId: string, enabled: boolean) => void
  addAndUpdateVideoAPI: (api: VideoSource) => void
  removeVideoAPI: (apiId: string) => void
  setAdFilteringEnabled: (enabled: boolean) => void
  selectAllAPIs: () => void
  deselectAllAPIs: () => void
  initializeEnvSources: () => Promise<void>
  importVideoAPIs: (apis: VideoSource[]) => void
  getSelectedAPIs: () => VideoSource[]
  resetVideoSources: () => Promise<void>
  replaceSubscriptionSources: (subscriptionId: string, sources: VideoSource[]) => void
  removeSubscriptionSources: (subscriptionId: string) => void
  reorderVideoAPIs: (orderedIds: string[]) => void
}

type ApiStore = ApiState & ApiActions

const toSourceStore = (state: ApiState): SourceStore => ({
  sources: state.videoAPIs,
  version: 1,
})

const fromSourceStore = (store: SourceStore): VideoSource[] => store.sources

const normalizeSourceList = (sources: VideoSource[]): VideoSource[] => {
  return sources.map((source, index) => normalizeVideoSource(source, index))
}

const reindexSourceList = (
  sources: VideoSource[],
  touchUpdatedAt = false,
  timestamp = Date.now(),
): VideoSource[] => {
  return normalizeSourceList(sources).map((source, index) => ({
    ...source,
    sortIndex: index,
    updatedAt: touchUpdatedAt ? new Date(timestamp) : source.updatedAt,
  }))
}

const applyDefaultNetworkSettings = (sources: VideoSource[]): VideoSource[] => {
  return sources.map((source, index) =>
    normalizeVideoSource(
      {
        ...source,
        timeout: source.timeout ?? DEFAULT_SETTINGS.network.defaultTimeout,
        retry: source.retry ?? DEFAULT_SETTINGS.network.defaultRetry,
        updatedAt: source.updatedAt ? new Date(source.updatedAt) : new Date(),
      },
      index,
    ),
  )
}

export const useApiStore = create<ApiStore>()(
  devtools(
    persist(
      immer<ApiStore>((set, get) => ({
        videoAPIs: [],
        adFilteringEnabled: true,
        adFilteringUpdatedAt: Date.now(),

        setApiEnabled: (apiId, enabled) => {
          set(state => {
            const nextStore = setSourceEnabled(toSourceStore(state), apiId, enabled)
            state.videoAPIs = normalizeSourceList(fromSourceStore(nextStore))
          })
        },

        addAndUpdateVideoAPI: api => {
          set(state => {
            const store = toSourceStore(state)
            const isExisting = store.sources.some(
              source => source.id === api.id || (source.name === api.name && source.url === api.url),
            )

            const newStore = addSource(store, {
              ...api,
              syncOrigin: api.syncOrigin ?? 'manual',
              updatedAt: new Date(),
            })

            const nextSources = normalizeSourceList(fromSourceStore(newStore))
            if (!isExisting) {
              const inserted = nextSources.find(source => source.id === api.id)
              state.videoAPIs = reindexSourceList(
                inserted
                  ? [inserted, ...nextSources.filter(source => source.id !== inserted.id)]
                  : nextSources,
              )
              return
            }

            state.videoAPIs = reindexSourceList(nextSources)
          })
        },

        removeVideoAPI: apiId => {
          set(state => {
            const nextStore = removeSource(toSourceStore(state), apiId)
            state.videoAPIs = reindexSourceList(fromSourceStore(nextStore))
          })
        },

        setAdFilteringEnabled: enabled => {
          set(state => {
            state.adFilteringEnabled = enabled
            state.adFilteringUpdatedAt = Date.now()
          })
        },

        selectAllAPIs: () => {
          set(state => {
            const timestamp = Date.now()
            const nextStore = selectAllSources(toSourceStore(state))
            state.videoAPIs = reindexSourceList(fromSourceStore(nextStore), true, timestamp)
          })
        },

        deselectAllAPIs: () => {
          set(state => {
            const timestamp = Date.now()
            const nextStore = deselectAllSources(toSourceStore(state))
            state.videoAPIs = reindexSourceList(fromSourceStore(nextStore), true, timestamp)
          })
        },

        initializeEnvSources: async () => {
          const envSources = await getInitialVideoSources()
          if (envSources.length === 0) return

          set(state => {
            const { store } = importSources(toSourceStore(state), envSources, {
              defaultTimeout: useSettingStore.getState().network.defaultTimeout,
              defaultRetry: useSettingStore.getState().network.defaultRetry,
              skipInvalid: true,
            })
            state.videoAPIs = reindexSourceList(fromSourceStore(store))
          })
        },

        importVideoAPIs: apis => {
          set(state => {
            const store = toSourceStore(state)
            const apisWithIds = apis.map((api, index) => ({
              ...api,
              id: api.id || uuidv4(),
              syncOrigin: api.syncOrigin ?? 'manual',
              sortIndex: api.sortIndex ?? store.sources.length + index,
            }))

            const { store: nextStore } = importSources(store, apisWithIds, {
              defaultTimeout: useSettingStore.getState().network.defaultTimeout,
              defaultRetry: useSettingStore.getState().network.defaultRetry,
              skipInvalid: true,
            })

            state.videoAPIs = reindexSourceList(fromSourceStore(nextStore))
          })
        },

        getSelectedAPIs: () => {
          return getEnabledSources(toSourceStore(get()))
        },

        resetVideoSources: async () => {
          set(state => {
            state.videoAPIs = []
          })
          await get().initializeEnvSources()
        },

        replaceSubscriptionSources: (subscriptionId, sources) => {
          set(state => {
            const prefix = `sub:${subscriptionId}:`
            const oldEnabledMap = new Map<string, boolean>()

            state.videoAPIs
              .filter(source => source.id.startsWith(prefix))
              .forEach(source => {
                oldEnabledMap.set(`${source.name}||${source.url}`, source.isEnabled)
              })

            const nonSubscriptionSources = state.videoAPIs.filter(source => !source.id.startsWith(prefix))
            const newSources = sources.map((source, index) => {
              const key = `${source.name}||${source.url}`
              const prevEnabled = oldEnabledMap.get(key)
              return normalizeVideoSource(
                {
                  ...source,
                  isEnabled: prevEnabled !== undefined ? prevEnabled : source.isEnabled,
                  syncOrigin: 'subscription',
                },
                nonSubscriptionSources.length + index,
                'subscription',
              )
            })

            state.videoAPIs = reindexSourceList([...nonSubscriptionSources, ...newSources])
          })
        },

        removeSubscriptionSources: subscriptionId => {
          set(state => {
            const prefix = `sub:${subscriptionId}:`
            state.videoAPIs = reindexSourceList(
              state.videoAPIs.filter(source => !source.id.startsWith(prefix)),
            )
          })
        },

        reorderVideoAPIs: orderedIds => {
          set(state => {
            const timestamp = Date.now()
            const idIndexMap = new Map(orderedIds.map((id, index) => [id, index]))
            const sorted = [...state.videoAPIs].sort((left, right) => {
              const leftIndex = idIndexMap.get(left.id)
              const rightIndex = idIndexMap.get(right.id)
              if (leftIndex !== undefined && rightIndex !== undefined) return leftIndex - rightIndex
              if (leftIndex !== undefined) return -1
              if (rightIndex !== undefined) return 1
              return 0
            })

            state.videoAPIs = reindexSourceList(sorted, true, timestamp)
          })
        },
      })),
      {
        name: 'ouonnki-tv-api-store',
        version: 7,
        migrate: (persistedState: unknown, version: number) => {
          const state = persistedState as Partial<ApiState>

          if (version < 4) {
            state.videoAPIs = []
          }

          if (version < 5) {
            state.videoAPIs = applyDefaultNetworkSettings(state.videoAPIs ?? [])
          }

          if (version < 7) {
            state.videoAPIs = reindexSourceList(state.videoAPIs ?? [])
            state.adFilteringUpdatedAt = Date.now()
          }

          state.videoAPIs = normalizeSourceList(state.videoAPIs ?? [])
          state.adFilteringUpdatedAt ??= Date.now()
          return state as ApiState
        },
      },
    ),
    {
      name: 'ApiStore',
    },
  ),
)
