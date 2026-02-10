import type { TmdbMediaItem } from '@/shared/types/tmdb'
import type { VideoItem } from '@ouonnki/cms-core'
import { MediaPosterCard } from '@/shared/components/common/MediaPosterCard'
import { NoResultIcon } from '@/shared/components/icons'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/lib/utils'
import { AspectRatio } from '@/shared/components/ui/aspect-ratio'
import type { SearchMode } from './SearchModeToggle'

interface SearchResultsGridProps {
  /** 搜索模式 */
  mode: SearchMode
  /** TMDB 搜索结果 */
  tmdbResults?: TmdbMediaItem[]
  /** 直连搜索结果 */
  directResults?: VideoItem[]
  /** 是否加载中 */
  loading: boolean
  /** 直连搜索进度（已完成的源数量/总源数量） */
  searchProgress?: { completed: number; total: number }
  /** 总结果数量（来自 API 分页信息） */
  totalResults?: number
  /** 是否还有更多内容 */
  hasMore?: boolean
  /** 当前页是否已完成（仅 Direct 模式） */
  isCurrentPageComplete?: boolean
  /** 哨兵元素引用（用于滚动加载） */
  sentinelRef?: React.RefObject<HTMLDivElement | null>
  className?: string
}

// TMDB 图片基础 URL
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342'

// 骨架屏数量
const SKELETON_COUNT = 20

/**
 * ResultSkeleton - 结果骨架屏
 */
function ResultSkeleton() {
  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-lg">
        <AspectRatio ratio={2 / 3}>
          <Skeleton className="h-full w-full" />
        </AspectRatio>
      </div>
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}

/**
 * EmptyState - 空状态组件
 */
function EmptyState({ mode }: { mode: SearchMode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <NoResultIcon size={128} className="text-muted-foreground/30" />
      <p className="text-muted-foreground mt-4 text-sm">
        {mode === 'tmdb' ? '未找到相关内容，试试其他关键词' : '换个关键词试试吧'}
      </p>
    </div>
  )
}

/**
 * SearchProgress - 搜索进度组件
 */
function SearchProgress({ completed, total }: { completed: number; total: number }) {
  const percentage = total > 0 ? (completed / total) * 100 : 0

  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-muted-foreground text-sm">
        {completed}/{total} 源
      </span>
    </div>
  )
}

/**
 * SearchResultsGrid - 搜索结果网格组件
 */
export function SearchResultsGrid({
  mode,
  tmdbResults = [],
  directResults = [],
  loading,
  searchProgress,
  totalResults,
  hasMore = false,
  isCurrentPageComplete = true,
  sentinelRef,
  className,
}: SearchResultsGridProps) {
  // TMDB 模式：显示所有结果
  if (mode === 'tmdb') {
    const results = tmdbResults
    const hasResults = results.length > 0
    // 区分首次加载和加载更多
    const isInitialLoading = loading && !hasResults

    return (
      <div className={cn('space-y-6', className)}>
        {/* 结果统计 */}
        {hasResults && (
          <div className="text-muted-foreground text-sm">
            共找到 <span className="text-primary font-medium">{totalResults ?? results.length}</span> 个结果
          </div>
        )}

        {/* 内容区域 */}
        <div>
          {isInitialLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
              {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <ResultSkeleton key={index} />
              ))}
            </div>
          ) : hasResults ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
              {results.map(item => (
                <div key={`${item.mediaType}-${item.id}`}>
                  <MediaPosterCard
                    to={`/media/${item.mediaType}/${item.id}`}
                    posterUrl={item.posterPath ? `${TMDB_IMAGE_BASE}${item.posterPath}` : null}
                    title={item.title}
                    year={item.releaseDate ? item.releaseDate.split('-')[0] : undefined}
                    rating={item.voteAverage}
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState mode="tmdb" />
          )}
        </div>

        {/* 加载更多状态 */}
        {hasResults && (
          <div ref={sentinelRef} className="py-8 flex justify-center">
            {loading ? (
              <div className="text-muted-foreground text-sm flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                加载下一页...
              </div>
            ) : hasMore ? (
              <div className="text-muted-foreground text-sm">
                下滑加载更多
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                已加载全部内容
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Direct 模式：无分页，显示所有累积结果
  const results = directResults
  const hasResults = results.length > 0

  return (
    <div className={cn('space-y-6', className)}>
      {/* 直连模式搜索进度 */}
      {searchProgress && loading && (
        <SearchProgress completed={searchProgress.completed} total={searchProgress.total} />
      )}

      {/* 结果统计 */}
      {hasResults && (
        <div className="text-muted-foreground text-sm">
          共找到 <span className="text-primary font-medium">{results.length}</span> 个结果
        </div>
      )}

      {/* 内容区域 */}
      <div>
        {loading && !hasResults ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <ResultSkeleton key={index} />
            ))}
          </div>
        ) : hasResults ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
            {results.map((item, index) => (
              <div key={`${item.source_code}-${item.vod_id}-${index}`}>
                <MediaPosterCard
                  to={`/play/raw?id=${item.vod_id}&source=${item.source_code}`}
                  posterUrl={item.vod_pic || null}
                  title={item.vod_name}
                  year={item.vod_year}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState mode="direct" />
        )}
      </div>

      {/* 加载更多状态 */}
      {hasResults && (
        <div ref={sentinelRef} className="py-8 flex justify-center">
          {!hasMore ? (
            <div className="text-muted-foreground text-sm">
              已加载全部内容
            </div>
          ) : loading && isCurrentPageComplete ? (
            <div className="text-muted-foreground text-sm flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              加载下一页...
            </div>
          ) : !isCurrentPageComplete ? (
            <div className="text-muted-foreground text-sm flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              等待更多源返回结果...
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">
              下滑加载更多
            </div>
          )}
        </div>
      )}
    </div>
  )
}
