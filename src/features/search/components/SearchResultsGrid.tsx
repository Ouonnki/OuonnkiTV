import type { TmdbMediaItem } from '@/shared/types/tmdb'
import type { VideoItem } from '@ouonnki/cms-core'
import { MediaPosterCard } from '@/shared/components/common/MediaPosterCard'
import { NoResultIcon } from '@/shared/components/icons'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Pagination } from '@/shared/components/ui/pagination'
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
  /** 当前页码 */
  currentPage: number
  /** 总页数 */
  totalPages: number
  /** 总结果数（用于显示统计） */
  totalResults?: number
  /** 页码变更回调 */
  onPageChange: (page: number) => void
  /** 直连搜索进度（已完成的源数量/总源数量） */
  searchProgress?: { completed: number; total: number }
  className?: string
}

// TMDB 图片基础 URL
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342'

// 骨架屏数量
const SKELETON_COUNT = 12

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
  currentPage,
  totalPages,
  totalResults,
  onPageChange,
  searchProgress,
  className,
}: SearchResultsGridProps) {
  const results = mode === 'tmdb' ? tmdbResults : directResults
  const hasResults = results.length > 0

  // 显示的总结果数：优先使用传入的 totalResults，否则使用本地结果长度
  const displayTotalResults = totalResults ?? results.length

  return (
    <div className={cn('space-y-6', className)}>
      {/* 直连模式搜索进度 */}
      {mode === 'direct' && searchProgress && loading && (
        <SearchProgress completed={searchProgress.completed} total={searchProgress.total} />
      )}

      {/* 结果统计 - 加载时也保留 */}
      {hasResults && (
        <div className="text-muted-foreground text-sm">
          共找到 <span className="text-primary font-medium">{displayTotalResults}</span> 个结果
        </div>
      )}

      {/* 内容区域 */}
      <div>
        {/* 加载骨架屏 - TMDB 模式加载时始终显示骨架屏 */}
        {loading && mode === 'tmdb' && (
          <div
            key="tmdb-skeleton"
            className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8"
          >
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <ResultSkeleton key={index} />
            ))}
          </div>
        )}

        {/* 直连模式加载骨架屏 - 仅无结果时显示 */}
        {loading && mode === 'direct' && !hasResults && (
          <div
            key="direct-skeleton"
            className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8"
          >
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <ResultSkeleton key={index} />
            ))}
          </div>
        )}

        {/* 搜索结果网格 - TMDB 模式非加载时显示，直连模式有结果时显示 */}
        {((mode === 'tmdb' && !loading && hasResults) || (mode === 'direct' && hasResults)) && (
          <div
            key={`results-${mode}`}
            className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8"
          >
            {mode === 'tmdb'
              ? tmdbResults.map((item) => (
                  <div key={`${item.mediaType}-${item.id}`}>
                    <MediaPosterCard
                      to={`/media/${item.mediaType}/${item.id}`}
                      posterUrl={item.posterPath ? `${TMDB_IMAGE_BASE}${item.posterPath}` : null}
                      title={item.title}
                      year={item.releaseDate ? item.releaseDate.split('-')[0] : undefined}
                      rating={item.voteAverage}
                    />
                  </div>
                ))
              : directResults.map((item, index) => (
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
        )}

        {/* 空状态 */}
        {!loading && !hasResults && <EmptyState mode={mode} />}
      </div>

      {/* 分页 */}
      {hasResults && totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <div className="bg-background/80 rounded-full px-2 py-1 shadow-lg ring-1 ring-white/10 backdrop-blur-xl backdrop-saturate-150">
            <Pagination
              page={currentPage}
              total={totalPages}
              onChange={onPageChange}
              showControls
              size={typeof window !== 'undefined' && window.innerWidth < 640 ? 'sm' : 'default'}
            />
          </div>
        </div>
      )}
    </div>
  )
}
