import { useState, useEffect } from 'react'
import { Play, Info } from 'lucide-react'
import Autoplay from 'embla-carousel-autoplay'

import { getBackdropUrl, getLogoUrl } from '@/shared/lib/tmdb'
import { Button } from '@/shared/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
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
  autoplayDelay = 5000,
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
          {/* 骨架屏遮罩层 - Netflix风格从左到右渐变 */}
          <div className="absolute inset-0 flex flex-col justify-center rounded-lg bg-gradient-to-r from-black/90 via-black/50 via-60% to-transparent px-8 py-5 md:px-16 md:py-12">
            <Skeleton className="mb-4 h-16 w-1/4 md:h-24" />
            <Skeleton className="mb-2 h-3 w-2/3 max-w-2xl md:mb-4 md:h-4" />
            <Skeleton className="mb-2 h-3 w-1/2 max-w-xl md:h-4" />
            <div className="mt-4 flex gap-3">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
            </div>
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
                  ratio={isMobile ? 4 / 3 : 9 / 4}
                  className="bg-muted overflow-hidden rounded-lg"
                >
                  {/* 背景图片 */}
                  <img
                    className="h-full w-full rounded-lg object-cover object-center md:object-top-right"
                    src={getBackdropUrl(item.backdropPath)}
                    alt={item.title}
                  />

                  {/* 遮罩层 - 移动端/平板从下到上渐变 */}
                  <div
                    className={`absolute inset-0 flex flex-col justify-end rounded-lg bg-gradient-to-t from-black/90 via-black/60 via-50% to-transparent px-5 py-5 transition-opacity duration-500 ease-out md:px-8 md:py-8 lg:hidden ${isActive ? 'opacity-100' : 'opacity-0'} `}
                  >
                    {/* Logo图片或标题文字 - 移动端/平板 */}
                    <div
                      className={`mb-4 flex h-16 items-end transition-all delay-100 duration-500 ease-out md:mb-6 md:h-24 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} `}
                    >
                      {item.logoPath ? (
                        <img
                          src={getLogoUrl(item.logoPath)}
                          alt={item.title}
                          className="max-h-16 max-w-[200px] object-contain md:max-h-24 md:max-w-xs"
                        />
                      ) : (
                        <h2 className="text-2xl font-bold text-white md:text-3xl">{item.title}</h2>
                      )}
                    </div>

                    {/* 介绍 - 移动端/平板 */}
                    <p
                      className={`mb-4 line-clamp-2 text-xs text-white/80 transition-all delay-150 duration-500 ease-out md:mb-5 md:line-clamp-3 md:max-w-xl md:text-sm ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} `}
                    >
                      {item.overview}
                    </p>

                    {/* 按钮组 - 移动端/平板 */}
                    <div
                      className={`flex gap-2 transition-all delay-200 duration-500 ease-out md:gap-3 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} `}
                    >
                      <Button
                        size="default"
                        className="h-9 gap-1.5 bg-white font-semibold text-black hover:bg-white/90 md:h-10 md:gap-2 md:text-base"
                      >
                        <Play className="size-4 fill-current md:size-5" />
                        立即播放
                      </Button>
                      <Button
                        size="default"
                        variant="secondary"
                        className="h-9 gap-1.5 bg-white/30 font-semibold text-white hover:bg-white/40 md:h-10 md:gap-2 md:text-base"
                      >
                        <Info className="size-4 md:size-5" />
                        视频详情
                      </Button>
                    </div>
                  </div>

                  {/* 遮罩层 - 桌面端Netflix风格从左到右渐变 */}
                  <div
                    className={`absolute inset-0 hidden flex-col justify-end rounded-lg bg-gradient-to-r from-black/90 via-black/50 via-40% to-transparent px-16 py-25 transition-opacity duration-500 ease-out lg:flex ${isActive ? 'opacity-100' : 'opacity-0'} `}
                  >
                    {/* Logo图片或标题文字 */}
                    <div
                      className={`mb-8 flex h-35 items-end transition-all delay-100 duration-500 ease-out ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} `}
                    >
                      {item.logoPath ? (
                        <img
                          src={getLogoUrl(item.logoPath)}
                          alt={item.title}
                          className="max-h-35 max-w-md object-contain xl:max-h-40 xl:max-w-lg"
                        />
                      ) : (
                        <h2 className="text-2xl font-bold text-white md:text-4xl lg:text-5xl">
                          {item.title}
                        </h2>
                      )}
                    </div>

                    {/* 介绍 */}
                    <p
                      className={`mb-5 line-clamp-3 max-w-xl text-[0.7rem] text-white/80 transition-all delay-150 duration-500 ease-out md:max-w-2xl md:text-base ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} `}
                    >
                      {item.overview}
                    </p>

                    {/* 按钮组 */}
                    <div
                      className={`flex gap-3 transition-all delay-200 duration-500 ease-out ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} `}
                    >
                      <Button
                        size="lg"
                        className="gap-2 bg-white font-semibold text-black hover:bg-white/90"
                      >
                        <Play className="size-5 fill-current" />
                        立即播放
                      </Button>
                      <Button
                        size="lg"
                        variant="secondary"
                        className="gap-2 bg-white/30 font-semibold text-white hover:bg-white/40"
                      >
                        <Info className="size-5" />
                        视频详情
                      </Button>
                    </div>
                  </div>
                </AspectRatio>
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
