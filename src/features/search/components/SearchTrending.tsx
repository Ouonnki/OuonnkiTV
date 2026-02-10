import { TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { type TmdbMediaItem } from '@/shared/types/tmdb'
import { Skeleton } from '@/shared/components/ui/skeleton'

interface SearchTrendingProps {
  trending: TmdbMediaItem[]
  onSearch: (query: string) => void
  disabled?: boolean
  isLoading?: boolean
  className?: string
}

export function SearchTrending({ trending, onSearch, className, disabled, isLoading }: SearchTrendingProps) {
  // 骨架屏状态
  if (isLoading) {
    // 生成随机宽度的骨架屏，让效果更自然（两排填满）
    const skeletonWidths = [
      'w-20', 'w-16', 'w-24', 'w-14', 'w-20', 'w-16', 'w-24', 'w-14',
      'w-16', 'w-20', 'w-14', 'w-24', 'w-16', 'w-20', 'w-14', 'w-24'
    ]

    return (
      <motion.div
        className={`w-full max-w-3xl px-4 sm:px-0 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="text-primary size-4" />
          <span className="text-muted-foreground text-sm font-medium">大家都在搜</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {skeletonWidths.map((widthClass, index) => (
            <Skeleton key={index} className={`h-8 ${widthClass} rounded-full`} />
          ))}
        </div>
      </motion.div>
    )
  }

  if (trending.length === 0) return null

  return (
    <motion.div
      className={`w-full max-w-3xl px-4 sm:px-0 ${className}`}
      initial={{ opacity: 0, y: 20, height: 0 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        height: 'auto',
        transition: {
          duration: 0.3,
          delay: 0.2 // Wait for TMDB section exit (0.2s delay + 0.3s duration overlapping slightly for smoothness)
        }
      }}
      exit={{ 
        opacity: 0,
        height: 0,
        transition: { duration: 0.2, delay: 0 } 
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="text-primary size-4" />
        <span className="text-muted-foreground text-sm font-medium">大家都在搜</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {trending.slice(0, 12).map((item) => (
          <button
            key={`${item.mediaType}-${item.id}`}
            type="button"
            disabled={disabled}
            onClick={() => onSearch(item.title)}
            className="bg-muted hover:bg-muted/80 hover:text-primary rounded-full px-3 py-1.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {item.title}
          </button>
        ))}
      </div>
    </motion.div>
  )
}
