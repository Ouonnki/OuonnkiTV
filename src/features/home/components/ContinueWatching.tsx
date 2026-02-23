import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/shared/components/ui/carousel'
import { AspectRatio } from '@/shared/components/ui/aspect-ratio'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { NavLink } from 'react-router'
import { useViewingHistoryStore } from '@/shared/store'
import { useEffect, useMemo, useState } from 'react'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { useTmdbEnabled } from '@/shared/hooks/useTmdbMode'
import { ViewingHistoryCard } from '@/shared/components/common'

/**
 * ContinueWatchingSkeleton - 骨架屏组件
 * 在数据加载完成前显示占位内容
 */
function ContinueWatchingSkeleton() {
  const isMobile = useIsMobile()
  // 根据屏幕尺寸计算骨架数量：移动端2个、平板3个、桌面5个
  const skeletonCount = isMobile
    ? 2
    : typeof window !== 'undefined' && window.innerWidth < 1024
      ? 3
      : 5

  return (
    <div>
      {/* 标题骨架 */}
      <div className="px-1">
        <Skeleton className="h-7 w-28" />
      </div>
      {/* 卡片骨架 */}
      <div className="flex gap-4 pt-2">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div key={index} className="flex-1">
            <AspectRatio ratio={1.778}>
              <Skeleton className="size-full rounded-lg" />
            </AspectRatio>
            <Skeleton className="mt-1 h-1 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * ContinueWatching - 继续观看组件
 * 展示用户的观看历史记录，支持轮播浏览
 */
export function ContinueWatching() {
  const { viewingHistory } = useViewingHistoryStore()
  const hasHydrated = useViewingHistoryStore.persist.hasHydrated()
  const tmdbEnabled = useTmdbEnabled()

  // TMDB 未启用时过滤 TMDB 记录
  const filteredHistory = useMemo(() => {
    if (tmdbEnabled) return viewingHistory
    return viewingHistory.filter(item => item.recordType !== 'tmdb')
  }, [viewingHistory, tmdbEnabled])

  const isMobile = useIsMobile()
  // 根据屏幕尺寸计算可见卡片数量：移动端2个、平板3个、桌面5个
  const visibleCount = isMobile
    ? 2
    : typeof window !== 'undefined' && window.innerWidth < 1024
      ? 3
      : 5
  const canDrag = filteredHistory.length > visibleCount

  // Carousel API 状态
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  // 监听 Carousel 滚动状态
  useEffect(() => {
    if (!carouselApi) return

    const onSelect = () => {
      setCanScrollPrev(carouselApi.canScrollPrev())
      setCanScrollNext(carouselApi.canScrollNext())
    }

    onSelect() // 初始化
    carouselApi.on('select', onSelect)
    carouselApi.on('reInit', onSelect)

    return () => {
      carouselApi.off('select', onSelect)
      carouselApi.off('reInit', onSelect)
    }
  }, [carouselApi])

  // Hydration 未完成时显示骨架屏
  if (!hasHydrated) {
    return <ContinueWatchingSkeleton />
  }

  // 如果没有观看历史，不渲染任何内容
  if (filteredHistory.length === 0) {
    return null
  }

  return (
    <div>
      {/* 标题区域 */}
      <div className="px-1">
        <NavLink className="group/title inline-flex items-center gap-1" to="/continue-watching">
          <h2 className="text-primary text-xl font-semibold">继续观看</h2>
          <ChevronRight className="text-primary/50 group-hover/title:text-primary size-5 transition-transform duration-200 group-hover/title:translate-x-1" />
        </NavLink>
      </div>
      {/* 滚动区域 */}
      <div className="pt-2">
        <Carousel opts={{ watchDrag: canDrag }} setApi={setCarouselApi}>
          <CarouselContent>
            {filteredHistory.map(item => {
              return (
                <CarouselItem
                  key={`${item.sourceCode}-${item.vodId}-${item.episodeIndex}`}
                  className="h-fit basis-1/2 rounded-lg md:basis-1/3 lg:basis-1/5"
                >
                  <ViewingHistoryCard item={item} />
                </CarouselItem>
              )
            })}
          </CarouselContent>
          {/* 导航按钮 - 根据滚动位置显示/隐藏 */}
          {canDrag && canScrollPrev && (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-1/2 -left-5 size-10 -translate-y-1/2 rounded-full md:size-12 dark:bg-zinc-800"
              onClick={() => carouselApi?.scrollPrev()}
            >
              <ChevronLeft className="size-4 translate-x-1.5 md:size-6 md:translate-x-0.5" />
            </Button>
          )}
          {canDrag && canScrollNext && (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-1/2 -right-5 size-10 -translate-y-1/2 rounded-full md:size-12 dark:bg-zinc-800"
              onClick={() => carouselApi?.scrollNext()}
            >
              <ChevronRight className="size-4 -translate-x-1.5 md:size-6 md:-translate-x-0.5" />
            </Button>
          )}
        </Carousel>
      </div>
    </div>
  )
}
