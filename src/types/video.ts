// 从 cms-core 重新导出类型（保持向后兼容）
export type {
  VideoItem,
  VideoDetail,
  SearchResult,
  DetailResult,
  VideoSource as VideoApi,
} from '@ouonnki/cms-core'

// 观看历史项
export interface ViewingHistoryItem {
  title: string
  imageUrl: string
  episodeIndex: number
  episodeName?: string // 集数名称，例如 "第01集"、"第1集" 等
  sourceCode: string
  sourceName: string
  vodId: string
  timestamp: number
  playbackPosition: number
  duration: number
}

// 扩展的 VideoApi 类型（用于需要 updatedAt 必填的场景）
export interface VideoApiWithDate {
  id: string
  name: string
  url: string
  detailUrl?: string
  timeout?: number
  retry?: number
  isEnabled: boolean
  updatedAt: Date
}
