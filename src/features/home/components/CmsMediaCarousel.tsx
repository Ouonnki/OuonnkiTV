import { useEffect, useState } from 'react'
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
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { buildCmsPlayPath } from '@/shared/lib/routes'
import type { VideoItem } from '@ouonnki/cms-core'

interface CmsMediaCarouselProps {
  /** 板块标题 */
  title: string
  /** CMS 视频数据列表 */
  items: VideoItem[]
  /** 加载状态 */
  loading?: boolean
}

/**
 * CmsMediaCarouselSkeleton - 骨架屏组件
 */
function CmsMediaCarouselSkeleton({ title }: { title: string }) {
  const isMobile = useIsMobile()
  const skeletonCount = isMobile
    ? 3
    : typeof window !== 'undefined' && window.innerWidth < 1024
      ? 4
      : 6

  return (
    <div>
      <div className="px-1">
        <h2 className="text-primary text-xl font-semibold">{title}</h2>
      </div>
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
 * CmsMediaCarousel - CMS 视频卡片轮播组件
 * 展示 CMS 视频源的视频列表，使用竖向海报卡片
 */
export function CmsMediaCarousel({ title, items, loading = false }: CmsMediaCarouselProps) {
  const isMobile = useIsMobile()
  const isTablet = !isMobile && typeof window !== 'undefined' && window.innerWidth < 1024
  const visibleCount = isMobile ? 3 : isTablet ? 4 : 6
  const slidesToScroll = isMobile ? 3 : isTablet ? 4 : 6
  const canDrag = items.length > visibleCount

  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  useEffect(() => {
    if (!carouselApi) return

    const onSelect = () => {
      setCanScrollPrev(carouselApi.canScrollPrev())
      setCanScrollNext(carouselApi.canScrollNext())
    }

    onSelect()
    carouselApi.on('select', onSelect)
    carouselApi.on('reInit', onSelect)

    return () => {
      carouselApi.off('select', onSelect)
      carouselApi.off('reInit', onSelect)
    }
  }, [carouselApi])

  if (loading) {
    return <CmsMediaCarouselSkeleton title={title} />
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="group/carousel">
      <div className="px-1">
        <h2 className="text-primary text-xl font-semibold">{title}</h2>
      </div>
      <div className="pt-2">
        <Carousel opts={{ watchDrag: canDrag, slidesToScroll }} setApi={setCarouselApi}>
          <CarouselContent>
            {items.map(item => (
              <CarouselItem
                key={`${item.source_code}-${item.vod_id}`}
                className="h-fit basis-1/3 md:basis-1/4 lg:basis-1/6"
              >
                <MediaPosterCard
                  to={buildCmsPlayPath(item.source_code || '', String(item.vod_id))}
                  posterUrl={item.vod_pic}
                  title={item.vod_name}
                  year={item.vod_year}
                  topRightLabel={item.vod_remarks || undefined}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
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
