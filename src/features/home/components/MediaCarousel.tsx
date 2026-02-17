import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MediaPosterCard } from '@/shared/components/common'
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
import { useEffect, useState } from 'react'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { getPosterUrl } from '@/shared/lib/tmdb'
import type { TmdbMediaItem } from '@/shared/types/tmdb'
import { buildTmdbDetailPath } from '@/shared/lib/routes'

interface MediaCarouselProps {
  /** 板块标题 */
  title: string
  /** 媒体数据列表 */
  items: TmdbMediaItem[]
  /** 加载状态 */
  loading?: boolean
  /** 查看全部 */
  linkTo?: string
}

/**
 * MediaCarouselSkeleton - 骨架屏组件
 */
function MediaCarouselSkeleton({ title }: { title: string }) {
  const isMobile = useIsMobile()
  // 根据屏幕尺寸计算骨架数量：移动端3个、平板4个、桌面6个
  const skeletonCount = isMobile
    ? 3
    : typeof window !== 'undefined' && window.innerWidth < 1024
      ? 4
      : 6

  return (
    <div>
      {/* 标题 */}
      <div className="px-1">
        <h2 className="text-primary text-xl font-semibold">{title}</h2>
      </div>
      {/* 卡片骨架 */}
      <div className="flex gap-4 pt-2">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div key={index} className="flex-1">
            <AspectRatio ratio={2 / 3}>
              <Skeleton className="size-full rounded-lg" />
            </AspectRatio>
            <Skeleton className="mt-2 h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * MediaCarousel - 媒体轮播组件
 * 展示电影或剧集列表，支持轮播浏览，使用竖向海报卡片
 */
export function MediaCarousel({ title, items, loading = false, linkTo }: MediaCarouselProps) {
  const isMobile = useIsMobile()
  const isTablet = !isMobile && typeof window !== 'undefined' && window.innerWidth < 1024
  // 根据屏幕尺寸计算可见卡片数量
  const visibleCount = isMobile ? 3 : isTablet ? 4 : 6
  // 每次滚动的卡片数量
  const slidesToScroll = isMobile ? 3 : isTablet ? 4 : 6
  const canDrag = items.length > visibleCount

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

  // 加载状态时显示骨架屏
  if (loading) {
    return <MediaCarouselSkeleton title={title} />
  }

  // 如果没有数据，不渲染任何内容
  if (items.length === 0) {
    return null
  }

  return (
    <div className="group/carousel">
      {/* 标题区域 */}
      <div className="px-1">
        {linkTo ? (
          <NavLink className="group/title inline-flex items-center gap-1" to={linkTo}>
            <h2 className="text-primary text-xl font-semibold">{title}</h2>
            <ChevronRight className="text-primary/50 group-hover/title:text-primary size-5 transition-transform duration-200 group-hover/title:translate-x-1" />
          </NavLink>
        ) : (
          <h2 className="text-primary text-xl font-semibold">{title}</h2>
        )}
      </div>
      {/* 滚动区域 */}
      <div className="pt-2">
        <Carousel opts={{ watchDrag: canDrag, slidesToScroll }} setApi={setCarouselApi}>
          <CarouselContent>
            {items.map(item => (
              <CarouselItem key={item.id} className="h-fit basis-1/3 md:basis-1/4 lg:basis-1/6">
                <MediaPosterCard
                  to={buildTmdbDetailPath(item.mediaType, item.id)}
                  posterUrl={getPosterUrl(item.posterPath, 'w342')}
                  title={item.title}
                  year={item.releaseDate ? item.releaseDate.split('-')[0] : undefined}
                  rating={item.voteAverage}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* 导航按钮 - 移动端/平板常显，PC 端 hover 显示 */}
          {canDrag && canScrollPrev && (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-1/2 -left-5 size-10 -translate-y-1/2 rounded-full transition-opacity duration-300 md:size-12 lg:opacity-0 lg:group-hover/carousel:opacity-100 dark:bg-zinc-800"
              onClick={() => carouselApi?.scrollPrev()}
            >
              <ChevronLeft className="size-4 translate-x-1.5 md:size-6 md:translate-x-0.5" />
            </Button>
          )}
          {canDrag && canScrollNext && (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-1/2 -right-5 size-10 -translate-y-1/2 rounded-full transition-opacity duration-300 md:size-12 lg:opacity-0 lg:group-hover/carousel:opacity-100 dark:bg-zinc-800"
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
