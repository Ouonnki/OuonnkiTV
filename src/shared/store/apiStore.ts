import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { VideoSource, SourceStore } from '@ouonnki/cms-core'
import {
  addSource,
  removeSource,
  setSourceEnabled,
  selectAllSources,
  deselectAllSources,
  getEnabledSources,
  importSources,
} from '@ouonnki/cms-core/source'
import { getInitialVideoSources } from '@/shared/config/api.config'
import { v4 as uuidv4 } from 'uuid'
import { useSettingStore } from './settingStore'

// 保持向后兼容的类型别名
export type VideoApi = VideoSource

interface ApiState {
  // 视频源列表
  videoAPIs: VideoSource[]
  // 广告过滤开关
  adFilteringEnabled: boolean
}

interface ApiActions {
  // 设置 API 启用状态
  setApiEnabled: (apiId: string, enabled: boolean) => void
  // 添加视频 API
  addAndUpdateVideoAPI: (api: VideoSource) => void
  // 删除视频 API
  removeVideoAPI: (apiId: string) => void
  // 设置广告过滤
  setAdFilteringEnabled: (enabled: boolean) => void
  // 全选 API
  selectAllAPIs: () => void
  // 取消全选
  deselectAllAPIs: () => void
  // 初始化环境变量中的视频源
  initializeEnvSources: () => void
  // 批量导入视频源
  importVideoAPIs: (apis: VideoSource[]) => void
  // 获取选中的视频源
  getSelectedAPIs: () => VideoSource[]
  // 重置视频源
  resetVideoSources: () => Promise<void>
}

type ApiStore = ApiState & ApiActions

/**
 * 将ApiState转换为SourceStore格式以便使用cms-core纯函数
 */
function toSourceStore(state: ApiState): SourceStore {
  return {
    sources: state.videoAPIs,
    version: 1,
  }
}

/**
 * 从SourceStore提取sources到videoAPIs
 */
function fromSourceStore(store: SourceStore): VideoSource[] {
  return store.sources
}

export const useApiStore = create<ApiStore>()(
  devtools(
    persist(
      immer<ApiStore>((set, get) => ({
        videoAPIs: [],
        adFilteringEnabled: true,

        // Actions - 使用cms-core纯函数
        setApiEnabled: (apiId: string, enabled: boolean) => {
          set(state => {
            const store = toSourceStore(state)
            const newStore = setSourceEnabled(store, apiId, enabled)
            state.videoAPIs = fromSourceStore(newStore)
          })
        },

        addAndUpdateVideoAPI: (api: VideoSource) => {
          set(state => {
            const store = toSourceStore(state)
            const isExisting = store.sources.some(
              s => s.id === api.id || (s.name === api.name && s.url === api.url),
            )
            // addSource会自动处理添加或更新
            const newStore = addSource(store, {
              ...api,
              updatedAt: new Date(),
            })
            const nextSources = fromSourceStore(newStore)

            // 新增源默认置顶；更新源保持原有顺序
            if (!isExisting) {
              const inserted = nextSources.find(source => source.id === api.id)
              state.videoAPIs = inserted
                ? [inserted, ...nextSources.filter(source => source.id !== inserted.id)]
                : nextSources
            } else {
              state.videoAPIs = nextSources
            }
          })
        },

        removeVideoAPI: (apiId: string) => {
          set(state => {
            const store = toSourceStore(state)
            const newStore = removeSource(store, apiId)
            state.videoAPIs = fromSourceStore(newStore)
          })
        },

        setAdFilteringEnabled: (enabled: boolean) => {
          set(state => {
            state.adFilteringEnabled = enabled
          })
        },

        selectAllAPIs: () => {
          set(state => {
            const store = toSourceStore(state)
            const newStore = selectAllSources(store)
            state.videoAPIs = fromSourceStore(newStore)
          })
        },

        deselectAllAPIs: () => {
          set(state => {
            const store = toSourceStore(state)
            const newStore = deselectAllSources(store)
            state.videoAPIs = fromSourceStore(newStore)
          })
        },

        initializeEnvSources: async () => {
          const envSources = await getInitialVideoSources()
          console.log(envSources)
          set(state => {
            if (envSources.length > 0) {
              const store = toSourceStore(state)
              const { store: newStore } = importSources(store, envSources, {
                defaultTimeout: useSettingStore.getState().network.defaultTimeout || 3000,
                defaultRetry: useSettingStore.getState().network.defaultRetry || 3,
                skipInvalid: true,
              })
              state.videoAPIs = fromSourceStore(newStore)
            }
          })
        },

        importVideoAPIs: (apis: VideoSource[]) => {
          set(state => {
            const store = toSourceStore(state)
            // 为没有ID的源生成UUID
            const apisWithIds = apis.map(api => ({
              ...api,
              id: api.id || uuidv4(),
            }))
            const { store: newStore } = importSources(store, apisWithIds, {
              defaultTimeout: useSettingStore.getState().network.defaultTimeout || 3000,
              defaultRetry: useSettingStore.getState().network.defaultRetry || 3,
              skipInvalid: true,
            })
            state.videoAPIs = fromSourceStore(newStore)
          })
        },

        getSelectedAPIs: () => {
          const store = toSourceStore(get())
          return getEnabledSources(store)
        },

        resetVideoSources: async () => {
          set(state => {
            state.videoAPIs = []
          })
          await get().initializeEnvSources()
        },
      })),
      {
        name: 'ouonnki-tv-api-store', // 持久化存储的键名
        version: 5, // 保持版本号不变以兼容现有数据
        migrate: (persistedState: unknown, version: number) => {
          const state = persistedState as Partial<ApiState>

          if (version < 4) {
            state.videoAPIs = []
          }

          if (version < 5) {
            state.videoAPIs =
              state.videoAPIs?.map(api => ({
                ...api,
                timeout: 3000,
                retry: 3,
                updatedAt: new Date(),
              })) || []
          }

          return state
        },
      },
    ),
    {
      name: 'ApiStore', // DevTools 中显示的名称
    },
  ),
)
