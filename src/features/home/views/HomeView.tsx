import { useTmdbNowPlaying } from '@/shared/hooks/useTmdb'
import { FeaturedCarousel } from '../components/FeaturedCarousel'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/shared/components/ui/carousel'
import { AspectRatio } from '@/shared/components/ui/aspect-ratio'
import { Button } from '@/shared/components/ui/button'
import { Play, Info } from 'lucide-react'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { getBackdropUrl, getLogoUrl, getPosterUrl } from '@/shared/lib/tmdb'
import { Progress } from '@/shared/components/ui/progress'
import { NavLink } from 'react-router'
import { useViewingHistoryStore } from '@/shared/store'
import { useEffect, useState } from 'react'

/**
 * HomeView - 首页视图
 */
export default function HomeView() {
  const { viewingHistory } = useViewingHistoryStore()
  const { trending, loading } = useTmdbNowPlaying()

  const isMobile = useIsMobile()
  // 根据屏幕尺寸计算可见卡片数量：移动端2个、平板3个、桌面5个
  const visibleCount = isMobile
    ? 2
    : typeof window !== 'undefined' && window.innerWidth < 1024
      ? 3
      : 5
  const canDrag = viewingHistory.length > visibleCount

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

  return (
    <div>
      <FeaturedCarousel items={trending} loading={loading.trending} />
      <div className="h-6"></div>
      <div>
        {/* 继续观看 */}
        {viewingHistory.length > 0 && (
          <div>
            {/* 标题区域 */}
            <div className="px-1">
              <NavLink
                className="group/title inline-flex items-center gap-1"
                to="/continue-watching"
              >
                <h2 className="text-primary text-xl font-semibold">继续观看</h2>
                <ChevronRight className="text-primary/50 group-hover/title:text-primary size-5 transition-transform duration-200 group-hover/title:translate-x-1" />
              </NavLink>
            </div>
            {/* 滚动区域 */}
            <div className="pt-2">
              <Carousel opts={{ watchDrag: canDrag }} setApi={setCarouselApi}>
                <CarouselContent>
                  {viewingHistory.map(item => {
                    return (
                      <CarouselItem
                        key={item.vodId}
                        className="h-fit basis-1/2 rounded-lg md:basis-1/3 lg:basis-1/5"
                      >
                        <NavLink
                          to={`/play/raw?source=${item.sourceCode}&id=${item.vodId}&ep=${item.episodeIndex}`}
                        >
                          <div className="group relative cursor-pointer overflow-hidden rounded-lg">
                            <AspectRatio ratio={1.778}>
                              <img
                                className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                                src={item.imageUrl}
                                alt={item.title}
                              />
                              {/* 默认：底部剧名 - hover 时淡出 */}
                              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6 transition-opacity duration-300 group-hover:opacity-0">
                                <span className="line-clamp-1 text-sm font-medium text-white">
                                  {item.title}
                                </span>
                              </div>
                            </AspectRatio>
                            {/* 进度条 - hover 时隐藏 */}
                            <Progress
                              className="h-1 transition-opacity duration-300 group-hover:opacity-0 [&>*]:bg-red-600 dark:[&>*]:bg-red-800"
                              value={(item.playbackPosition / item.duration) * 100}
                            />
                            {/* Hover 全卡片遮罩 + 播放按钮 */}
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                              <div className="flex size-12 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
                                <Play className="size-6 fill-current" />
                              </div>
                            </div>
                            {/* Hover：左上角剧集名 */}
                            <span className="pointer-events-none absolute top-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                              {item.episodeName}
                            </span>
                          </div>
                        </NavLink>
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
        )}
      </div>
    </div>
  )
}
