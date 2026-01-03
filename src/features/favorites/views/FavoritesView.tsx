import { Heart } from 'lucide-react'

/**
 * FavoritesView - 收藏页面
 * TODO: 实现收藏功能
 */
export default function FavoritesView() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Heart className="h-16 w-16 text-gray-300" />
      <h1 className="text-2xl font-bold text-gray-400">收藏</h1>
      <p className="text-gray-500">此功能正在开发中...</p>
    </div>
  )
}
