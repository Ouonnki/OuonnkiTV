import { History } from 'lucide-react'

/**
 * HistoryView - 观看历史页面
 * TODO: 实现完整的历史记录功能
 */
export default function HistoryView() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <History className="h-16 w-16 text-gray-300" />
      <h1 className="text-2xl font-bold text-gray-400">观看历史</h1>
      <p className="text-gray-500">此功能正在开发中...</p>
    </div>
  )
}
