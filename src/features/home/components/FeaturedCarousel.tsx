import { useState, useEffect } from 'react'
import { Play } from 'lucide-react'
import Autoplay from 'embla-carousel-autoplay'

import { getBackdropUrl } from '@/shared/lib/tmdb'
import { Button } from '@/shared/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/shared/components/ui/carousel'
import { AspectRatio } from '@/shared/components/ui/aspect-ratio'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import type { TmdbMediaItem } from '@/shared/types/tmdb'

interface FeaturedCarouselProps {
  items: TmdbMediaItem[]
  loading?: boolean
  autoplayDelay?: number
}

/**
 * FeaturedCarousel - 精选内容轮播图组件
 */
export function FeaturedCarousel({
  items,
  loading = false,
  autoplayDelay = 7000,
}: FeaturedCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [activeIndex, setActiveIndex] = useState(0)
  const isMobile = useIsMobile()

  // 监听 carousel 选择变化
  useEffect(() => {
    if (!api) return

    const onSelect = () => {
      setActiveIndex(api.selectedScrollSnap())
    }

    // 初始化时设置
    onSelect()

    api.on('select', onSelect)
    return () => {
      api.off('select', onSelect)
    }
  }, [api])

  // 骨架屏
  if (loading || items.length === 0) {
    return (
      <div>
        <AspectRatio
          ratio={isMobile ? 4 / 3 : 3 / 1}
          className="bg-muted overflow-hidden rounded-lg"
        >
          <Skeleton className="h-full w-full rounded-lg" />
          {/* 骨架屏遮罩层 */}
          <div className="absolute inset-0 flex flex-col justify-end rounded-lg bg-gradient-to-t from-black/80 via-black/50 via-40% to-transparent pt-8 pr-8 pb-5 pl-5 md:pb-16 md:pl-8">
            <Skeleton className="mb-2 h-8 w-1/3 md:h-12" />
            <Skeleton className="mb-2 h-3 w-2/3 max-w-2xl md:mb-4 md:h-4" />
            <Skeleton className="mb-2 h-3 w-1/2 max-w-xl md:h-4" />
            <Skeleton className="mt-2 h-10 w-32" />
          </div>
        </AspectRatio>
      </div>
    )
  }

  return (
    <div>
      <Carousel
        className="h-fit rounded-lg"
        opts={{
          align: 'center',
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: autoplayDelay,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]}
        setApi={setApi}
      >
        <CarouselContent>
          {items.map((item, index) => {
            const isActive = index === activeIndex

            return (
              <CarouselItem key={item.id} className="h-fit rounded-lg">
                <AspectRatio
                  ratio={isMobile ? 4 / 3 : 3 / 1}
                  className="bg-muted overflow-hidden rounded-lg"
                >
                  {/* 背景图片 */}
                  <img
                    className="h-full w-full rounded-lg object-cover object-top-right"
                    src={getBackdropUrl(item.backdropPath)}
                    alt={item.title}
                  />

                  {/* 遮罩层 */}
                  <div
                    className={`absolute inset-0 flex flex-col justify-end rounded-lg bg-gradient-to-t from-black/80 via-black/50 via-40% to-transparent pt-8 pr-8 pb-5 pl-5 transition-opacity duration-500 ease-out md:pb-16 md:pl-8 ${isActive ? 'opacity-100' : 'opacity-0'} `}
                  >
                    {/* 剧名 */}
                    <h2
                      className={`mb-2 text-2xl font-bold text-white transition-all delay-100 duration-500 ease-out md:text-4xl lg:text-5xl ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} `}
                    >
                      {item.title}
                    </h2>

                    {/* 介绍 */}
                    <p
                      className={`mb-2 line-clamp-2 max-w-2xl text-[0.7rem] text-white/80 transition-all delay-150 duration-500 ease-out md:mb-4 md:text-base ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} `}
                    >
                      {item.overview}
                    </p>

                    {/* 立即观看按钮 */}
                    <div
                      className={`transition-all delay-200 duration-500 ease-out ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} `}
                    >
                      <Button
                        size="lg"
                        className="gap-2 bg-white font-semibold text-black hover:bg-white/90"
                      >
                        <Play className="size-5 fill-current" />
                        立即观看
                      </Button>
                    </div>
                  </div>
                </AspectRatio>
              </CarouselItem>
            )
          })}
        </CarouselContent>

        {/* 左侧悬停区域 */}
        <div className="group/prev absolute top-0 left-0 z-10 hidden h-full w-1/4 md:block">
          <CarouselPrevious className="bg-background/20 text-primary/80 hover:bg-background/40 dark:bg-background/20 dark:hover:bg-background/40 left-6 size-16 border-0 opacity-0 transition-all duration-300 group-hover/prev:opacity-100" />
        </div>

        {/* 右侧悬停区域 */}
        <div className="group/next absolute top-0 right-0 z-10 hidden h-full w-1/4 md:block">
          <CarouselNext className="bg-background/20 text-primary/80 hover:bg-background/40 dark:bg-background/20 dark:hover:bg-background/40 right-6 size-16 border-0 opacity-0 transition-all duration-300 group-hover/next:opacity-100" />
        </div>
      </Carousel>
    </div>
  )
}
