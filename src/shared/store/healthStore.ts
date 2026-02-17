import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

/** 单个源的健康检测状态 */
export type HealthStatus = 'idle' | 'testing' | 'online' | 'offline' | 'timeout' | 'error'

export interface HealthResult {
  /** 当前状态 */
  status: HealthStatus
  /** 响应延迟（毫秒），仅 online 时有值 */
  latency: number | null
  /** 错误信息 */
  errorMessage: string | null
  /** 检测完成时间戳 */
  checkedAt: number | null
}

interface HealthState {
  /** 源 ID -> 健康结果 */
  results: Record<string, HealthResult>
}

interface HealthActions {
  /** 设置单个源的检测结果 */
  setResult: (sourceId: string, result: Partial<HealthResult>) => void
  /** 将多个源标记为 testing 状态 */
  setManyTesting: (sourceIds: string[]) => void
  /** 清空全部检测结果 */
  clearAll: () => void
}

type HealthStore = HealthState & HealthActions

const DEFAULT_RESULT: HealthResult = {
  status: 'idle',
  latency: null,
  errorMessage: null,
  checkedAt: null,
}

export const useHealthStore = create<HealthStore>()(
  devtools(
    immer<HealthStore>((set) => ({
      results: {},

      setResult: (sourceId, result) => {
        set(state => {
          const existing = state.results[sourceId] || { ...DEFAULT_RESULT }
          state.results[sourceId] = { ...existing, ...result }
        })
      },

      setManyTesting: (sourceIds) => {
        set(state => {
          for (const id of sourceIds) {
            state.results[id] = { ...DEFAULT_RESULT, status: 'testing' }
          }
        })
      },

      clearAll: () => {
        set(state => {
          state.results = {}
        })
      },
    })),
    { name: 'HealthStore' },
  ),
)
