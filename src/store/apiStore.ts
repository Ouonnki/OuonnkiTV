import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { VideoApi } from '@/types'
import { getInitialVideoSources } from '@/config/api.config'
import { v4 as uuidv4 } from 'uuid'
import { useSettingStore } from './settingStore'

interface ApiState {
  // 自定义 API 列表
  videoAPIs: VideoApi[]
  // 广告过滤开关
  adFilteringEnabled: boolean
}

interface ApiActions {
  // 设置 API 启用状态
  setApiEnabled: (apiId: string, enabled: boolean) => void
  // 添加视频 API
  addAndUpdateVideoAPI: (api: VideoApi) => void
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
  importVideoAPIs: (apis: VideoApi[]) => void
  // 获取选中的视频源
  getSelectedAPIs: () => VideoApi[]
  // 重置视频源
  resetVideoSources: () => Promise<void>
}

type ApiStore = ApiState & ApiActions

export const useApiStore = create<ApiStore>()(
  devtools(
    persist(
      immer<ApiStore>((set, get) => ({
        videoAPIs: [],
        adFilteringEnabled: true,

        // Actions
        setApiEnabled: (apiId: string, enabled: boolean) => {
          set(state => {
            const api = state.videoAPIs.find(a => a.id === apiId)
            if (api) {
              api.isEnabled = enabled
            }
          })
        },

        addAndUpdateVideoAPI: (api: VideoApi) => {
          set(state => {
            const index = state.videoAPIs.findIndex(a => a.id === api.id)
            if (index !== -1) {
              state.videoAPIs[index] = { ...api, updatedAt: new Date() }
            } else {
              state.videoAPIs.push({ ...api, updatedAt: new Date() })
            }
          })
        },

        removeVideoAPI: (apiId: string) => {
          set(state => {
            state.videoAPIs = state.videoAPIs.filter(api => api.id !== apiId)
          })
        },

        setAdFilteringEnabled: (enabled: boolean) => {
          set(state => {
            state.adFilteringEnabled = enabled
          })
        },

        selectAllAPIs: () => {
          set(state => {
            state.videoAPIs = state.videoAPIs.map(api => ({ ...api, isEnabled: true }))
          })
        },

        deselectAllAPIs: () => {
          set(state => {
            state.videoAPIs = state.videoAPIs.map(api => ({ ...api, isEnabled: false }))
          })
        },

        initializeEnvSources: async () => {
          const envSources = await getInitialVideoSources()
          console.log(envSources)
          set(state => {
            if (envSources.length > 0) {
              // 只添加不存在的环境变量源
              envSources.forEach(envSource => {
                if (envSource) {
                  // 确保 envSource 不为 null
                  const exists = state.videoAPIs.some(
                    api =>
                      api.id === envSource.id ||
                      (api.name === envSource.name && api.url === envSource.url),
                  )
                  if (!exists) {
                    state.videoAPIs.push(envSource)
                  }
                }
              })
            }
          })
        },

        importVideoAPIs: (apis: VideoApi[]) => {
          set(state => {
            apis.forEach(api => {
              // 检查是否已存在相同的源（基于name和url）
              const exists = state.videoAPIs.some(
                existingApi =>
                  existingApi.id === api.id ||
                  (existingApi.name === api.name && existingApi.url === api.url),
              )
              if (!exists) {
                state.videoAPIs.push({
                  id: api.id || uuidv4(),
                  name: api.name,
                  url: api.url,
                  detailUrl: api.detailUrl || '',
                  timeout: api.timeout || useSettingStore.getState().network.defaultTimeout || 3000,
                  retry: api.retry || useSettingStore.getState().network.defaultRetry || 3,
                  isEnabled: api.isEnabled ?? true,
                  updatedAt: api.updatedAt || new Date(),
                })
              }
            })
          })
        },

        getSelectedAPIs: () => {
          return get().videoAPIs.filter(api => api.isEnabled)
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
        version: 5, // 更新版本号以触发迁移
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
