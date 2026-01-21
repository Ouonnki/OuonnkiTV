import { motion, AnimatePresence } from 'framer-motion'
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
  /** 页码变更回调 */
  onPageChange: (page: number) => void
  /** 直连搜索进度（已完成的源数量/总源数量） */
  searchProgress?: { completed: number; total: number }
  className?: string
}

// TMDB 图片基础 URL
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342'

// 每页显示数量
const PAGE_SIZE = 20

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
    <motion.div
      className="flex flex-col items-center justify-center py-16"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <NoResultIcon size={128} className="text-muted-foreground/30" />
      <p className="text-muted-foreground mt-4 text-sm">
        {mode === 'tmdb' ? '未找到相关内容，试试其他关键词' : '换个关键词试试吧'}
      </p>
    </motion.div>
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
        <motion.div
          className="bg-primary h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
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
  onPageChange,
  searchProgress,
  className,
}: SearchResultsGridProps) {
  const results = mode === 'tmdb' ? tmdbResults : directResults
  const hasResults = results.length > 0

  // 计算当前页的结果（用于直连模式的本地分页）
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE
  const paginatedDirectResults = directResults.slice(startIndex, endIndex)

  return (
    <div className={cn('space-y-6', className)}>
      {/* 直连模式搜索进度 */}
      {mode === 'direct' && searchProgress && loading && (
        <SearchProgress completed={searchProgress.completed} total={searchProgress.total} />
      )}

      {/* 结果统计 - 加载时也保留 */}
      {hasResults && (
        <div className="text-muted-foreground text-sm">
          共找到 <span className="text-primary font-medium">{results.length}</span> 个结果
        </div>
      )}

      {/* 内容区域 - 使用 AnimatePresence 实现平滑过渡 */}
      <AnimatePresence mode="wait">
        {/* 加载骨架屏 - TMDB 模式加载时始终显示骨架屏 */}
        {loading && mode === 'tmdb' && (
          <motion.div
            key="tmdb-skeleton"
            className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <ResultSkeleton key={index} />
            ))}
          </motion.div>
        )}

        {/* 直连模式加载骨架屏 - 仅无结果时显示 */}
        {loading && mode === 'direct' && !hasResults && (
          <motion.div
            key="direct-skeleton"
            className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <ResultSkeleton key={index} />
            ))}
          </motion.div>
        )}

        {/* 搜索结果网格 - TMDB 模式非加载时显示，直连模式有结果时显示 */}
        {((mode === 'tmdb' && !loading && hasResults) || (mode === 'direct' && hasResults)) && (
          <motion.div
            key={`results-${mode}`}
            className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {mode === 'tmdb'
              ? tmdbResults.map((item) => (
                  <motion.div
                    key={`${item.mediaType}-${item.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MediaPosterCard
                      to={`/media/${item.mediaType}/${item.id}`}
                      posterUrl={item.posterPath ? `${TMDB_IMAGE_BASE}${item.posterPath}` : null}
                      title={item.title}
                    />
                  </motion.div>
                ))
              : paginatedDirectResults.map((item, index) => (
                  <motion.div
                    key={`${item.source_code}-${item.vod_id}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                  >
                    <MediaPosterCard
                      to={`/play/raw?id=${item.vod_id}&source=${item.source_code}`}
                      posterUrl={item.vod_pic || null}
                      title={item.vod_name}
                    />
                  </motion.div>
                ))}
          </motion.div>
        )}

        {/* 空状态 */}
        {!loading && !hasResults && <EmptyState mode={mode} />}
      </AnimatePresence>

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
