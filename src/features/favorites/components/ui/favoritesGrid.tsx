import { Checkbox } from '@/shared/components/ui/checkbox'
import { MediaPosterCard } from '@/shared/components/common/MediaPosterCard'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { NoResultIcon } from '@/shared/components/icons'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/shared/components/ui/context-menu'
import { Eye, EyeOff, CheckCircle, Trash2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { FavoriteWatchStatus } from '../../types/favorites'
import type { FavoriteItem } from '../../types/favorites'
import { getSourceColorScheme } from '@/shared/lib/source-colors'
import { useCallback } from 'react'
import { getPosterUrl } from '@/shared/lib/tmdb'

/** 观看状态配置 */
const watchStatusOptions = [
  { value: FavoriteWatchStatus.NOT_WATCHED, label: '未观看', icon: EyeOff },
  { value: FavoriteWatchStatus.WATCHING, label: '正在看', icon: Eye },
  { value: FavoriteWatchStatus.COMPLETED, label: '已看完', icon: CheckCircle },
] as const

interface FavoritesGridProps {
  /** 收藏列表 */
  favorites: FavoriteItem[]
  /** 已选中的 ID 集合 */
  selectedIds: Set<string>
  /** 选择状态变化回调 */
  onSelectionChange: (selected: Set<string>) => void
  /** 卡片点击回调（非多选模式时） */
  onCardClick?: (item: FavoriteItem) => void
  /** 更改观看状态回调 */
  onUpdateWatchStatus?: (id: string, status: FavoriteWatchStatus) => void
  /** 删除单个收藏回调 */
  onRemoveFavorite?: (id: string) => void
  /** 是否处于多选模式 */
  selectionMode: boolean
  /** 是否加载中 */
  loading?: boolean
}

/**
 * 将 FavoriteItem 转换为 MediaPosterCard props
 */
function favoriteToPosterCard(item: FavoriteItem) {
  if (item.sourceType === 'tmdb') {
    const { media } = item
    return {
      to: `/media/${item.media.mediaType}/${item.media.id}`,
      posterUrl: getPosterUrl(media.posterPath, 'w342') || null,
      title: media.title,
      year: media.releaseDate?.split('-')[0],
      rating: media.voteAverage * 10, // 转换为 0-10
    }
  } else {
    const { media } = item
    return {
      to: `/play/raw?id=${media.vodId}&source=${media.sourceCode}`,
      posterUrl: media.vodPic || null,
      title: media.vodName,
      year: media.vodYear,
      topRightLabel: media.sourceName,
      topRightLabelColorScheme: getSourceColorScheme(media.sourceCode),
    }
  }
}

/**
 * FavoritesGrid - 收藏网格组件
 * 复用 SearchResultsGrid 的响应式网格布局
 */
export function FavoritesGrid({
  favorites,
  selectedIds,
  onSelectionChange,
  onCardClick,
  onUpdateWatchStatus,
  onRemoveFavorite,
  selectionMode,
  loading = false,
}: FavoritesGridProps) {
  // 处理单个项的选中状态切换
  const toggleItemSelection = useCallback(
    (item: FavoriteItem) => {
      const isSelected = selectedIds.has(item.id)
      const next = new Set(selectedIds)
      if (isSelected) {
        next.delete(item.id)
      } else {
        next.add(item.id)
      }
      onSelectionChange(next)
    },
    [selectedIds, onSelectionChange],
  )

  // 处理卡片点击
  const handleCardClick = useCallback(
    (item: FavoriteItem) => {
      if (selectionMode) {
        // 多选模式：切换选中状态
        toggleItemSelection(item)
      } else {
        // 普通模式：跳转到详情
        onCardClick?.(item)
      }
    },
    [selectionMode, toggleItemSelection, onCardClick],
  )

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
        {Array.from({ length: 20 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-lg">
            <div className="aspect-[2/3] w-full">
              <Skeleton className="h-full w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <NoResultIcon size={128} className="text-muted-foreground/30" />
        <p className="text-muted-foreground mt-4 text-sm">暂无收藏内容</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
      {favorites.map(item => {
        const cardProps = favoriteToPosterCard(item)
        const isSelected = selectedIds.has(item.id)

        return (
          <ContextMenu key={item.id}>
            <ContextMenuTrigger asChild>
              <div
                className={cn(
                  'relative',
                  selectionMode && 'pointer-events-auto',
                )}
              >
                {/* 多选模式的复选框 */}
                {selectionMode && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={checked => {
                      const next = new Set(selectedIds)
                      if (checked) {
                        next.add(item.id)
                      } else {
                        next.delete(item.id)
                      }
                      onSelectionChange(next)
                    }}
                    onClick={e => {
                      e.stopPropagation()
                    }}
                    className="pointer-events-auto absolute top-2 left-2 z-10 size-7 rounded-md shadow-sm"
                  />
                )}

                {/* 海报卡片容器 */}
                <div
                  className={cn(
                    selectionMode ? 'cursor-pointer' : 'cursor-pointer',
                    selectionMode && '[&_a]:pointer-events-none',
                  )}
                >
                  <div onClick={selectionMode ? () => handleCardClick(item) : undefined}>
                    <MediaPosterCard {...cardProps} />
                  </div>
                </div>

                {/* 选中状态的边框高亮 */}
                {isSelected && (
                  <div className="ring-primary ring-offset-background pointer-events-none absolute left-0 right-0 top-0 overflow-hidden rounded-lg ring-2 ring-offset-2" style={{ aspectRatio: '2/3' }} />
                )}
              </div>
            </ContextMenuTrigger>

            <ContextMenuContent>
              {/* 更改观看状态子菜单 */}
              <ContextMenuSub>
                <ContextMenuSubTrigger>
                  <Eye className="mr-2 size-4" />
                  观看状态
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  {watchStatusOptions.map(option => {
                    const Icon = option.icon
                    return (
                      <ContextMenuItem
                        key={option.value}
                        disabled={item.watchStatus === option.value}
                        onClick={() => onUpdateWatchStatus?.(item.id, option.value)}
                      >
                        <Icon className="mr-2 size-4" />
                        {option.label}
                        {item.watchStatus === option.value && (
                          <span className="text-muted-foreground ml-auto text-xs">当前</span>
                        )}
                      </ContextMenuItem>
                    )
                  })}
                </ContextMenuSubContent>
              </ContextMenuSub>

              <ContextMenuSeparator />

              {/* 删除收藏 */}
              <ContextMenuItem
                variant="destructive"
                onClick={() => onRemoveFavorite?.(item.id)}
              >
                <Trash2 className="mr-2 size-4" />
                删除收藏
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )
      })}
    </div>
  )
}
