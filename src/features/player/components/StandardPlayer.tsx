import { Film } from 'lucide-react'

/**
 * StandardPlayer - TMDB 元数据模式播放器
 * 路由: /play/:type/:tmdbId
 * TODO: 实现 TMDB 集成
 */
export default function StandardPlayer() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-black text-white">
      <Film className="h-16 w-16 text-gray-500" />
      <h1 className="text-2xl font-bold text-gray-400">TMDB 播放器</h1>
      <p className="text-gray-500">此功能正在开发中...</p>
    </div>
  )
}
