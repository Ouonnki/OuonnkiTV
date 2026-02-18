import { useEffect, useMemo, useState } from 'react'
import { MoreHorizontal, Play, Info } from 'lucide-react'
import Autoplay from 'embla-carousel-autoplay'
import { NavLink, useNavigate } from 'react-router'

import { getBackdropUrl, getLogoUrl } from '@/shared/lib/tmdb'
import { buildTmdbDetailPath, buildTmdbPlayPath } from '@/shared/lib/routes'
import { buildHistoryPlayPath, isTmdbHistoryItem } from '@/shared/lib/viewingHistory'
import { Button } from '@/shared/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/shared/components/ui/carousel'
import { AspectRatio } from '@/shared/components/ui/aspect-ratio'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { useViewingHistoryStore } from '@/shared/store/viewingHistoryStore'
import type { TmdbMediaItem } from '@/shared/types/tmdb'
import type { ViewingHistoryItem } from '@/shared/types/video'

// 平板断点 (768px - 1024px)
const TABLET_BREAKPOINT = 1024

// 自定义hook检测平板尺寸
function useIsTablet() {
  const [isTablet, setIsTablet] = useState<boolean>(false)

  useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth
      setIsTablet(width >= 768 && width < TABLET_BREAKPOINT)
    }

    checkTablet()
    window.addEventListener('resize', checkTablet)
    return () => window.removeEventListener('resize', checkTablet)
  }, [])

  return isTablet
}

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
  const navigate = useNavigate()
  const [api, setApi] = useState<CarouselApi>()
  const [activeIndex, setActiveIndex] = useState(0)
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const viewingHistory = useViewingHistoryStore(state => state.viewingHistory)

  const latestTmdbHistoryMap = useMemo(() => {
    const latestHistoryMap = new Map<string, ViewingHistoryItem>()
    const latestMappedHistoryMap = new Map<string, ViewingHistoryItem>()

    viewingHistory.forEach(historyItem => {
      if (!isTmdbHistoryItem(historyItem)) return

      const mediaKey = `${historyItem.tmdbMediaType}-${historyItem.tmdbId}`
      const latestHistory = latestHistoryMap.get(mediaKey)
      const latestMappedHistory = latestMappedHistoryMap.get(mediaKey)

      if (!latestHistory || historyItem.timestamp > latestHistory.timestamp) {
        latestHistoryMap.set(mediaKey, historyItem)
      }

      if (!historyItem.sourceCode || !historyItem.vodId) return

      if (!latestMappedHistory || historyItem.timestamp > latestMappedHistory.timestamp) {
        latestMappedHistoryMap.set(mediaKey, historyItem)
      }
    })

    const resultMap = new Map<string, ViewingHistoryItem>()
    latestHistoryMap.forEach((historyItem, mediaKey) => {
      resultMap.set(mediaKey, latestMappedHistoryMap.get(mediaKey) || historyItem)
    })
    return resultMap
  }, [viewingHistory])

  // 根据设备类型获取AspectRatio
  // 移动端: 4/3, 平板: 16/9, 桌面: 9/4
  const getAspectRatio = () => {
    if (isMobile) return 4 / 3
    if (isTablet) return 16 / 9
    return 9 / 4
  }

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
  if (loading) {
    return (
      <div>
        <AspectRatio ratio={getAspectRatio()} className="bg-muted overflow-hidden rounded-lg">
          <Skeleton className="h-full w-full rounded-lg" />
          {/* 骨架屏遮罩层 - 移动端/平板 */}
          <div className="absolute inset-0 flex min-h-0 flex-col justify-end rounded-lg bg-gradient-to-t from-black/90 via-black/50 via-60% to-transparent px-6 pt-4 pb-6 md:px-8 md:pb-8 lg:hidden">
            <Skeleton className="mb-3 h-8 w-36 md:mb-4 md:h-10 md:w-48" />
            <Skeleton className="mb-2 h-3 w-2/3 md:h-4" />
            <Skeleton className="mb-3 h-3 w-1/2 md:mb-4 md:h-4" />
            <div className="flex gap-2 md:gap-3">
              <Skeleton className="h-8 w-20 md:h-9 md:w-24" />
              <Skeleton className="h-8 w-20 md:h-9 md:w-24" />
            </div>
          </div>
          {/* 骨架屏遮罩层 - 桌面端 */}
          <div className="absolute inset-0 hidden flex-col justify-end rounded-lg bg-gradient-to-r from-black/90 via-black/50 via-40% to-transparent px-16 pt-25 pb-16 lg:flex">
            <Skeleton className="mb-8 h-20 w-80 xl:h-24 xl:w-96" />
            <Skeleton className="mb-2 h-4 w-2/3 max-w-2xl" />
            <Skeleton className="mb-5 h-4 w-1/2 max-w-xl" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
        </AspectRatio>
      </div>
    )
  }

  if (items.length === 0) {
    return null
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
            const playPath = buildTmdbPlayPath(item.mediaType, item.id)
            const detailPath = buildTmdbDetailPath(item.mediaType, item.id)
            const latestTmdbHistory = latestTmdbHistoryMap.get(`${item.mediaType}-${item.id}`)
            const continueWatchingLabel = latestTmdbHistory
              ? latestTmdbHistory.episodeName || `第${latestTmdbHistory.episodeIndex + 1}集`
              : ''
            const continueWatchingProgressLabel = latestTmdbHistory
              ? latestTmdbHistory.duration > 0
                ? `已观看 ${Math.round(
                    Math.min(
                      100,
                      Math.max(
                        0,
                        (latestTmdbHistory.playbackPosition / latestTmdbHistory.duration) * 100,
                      ),
                    ),
                  )}%`
                : '已开始观看'
              : ''
            const continueWatchingPath = latestTmdbHistory
              ? latestTmdbHistory.sourceCode && latestTmdbHistory.vodId
                ? buildHistoryPlayPath(latestTmdbHistory)
                : buildTmdbPlayPath(item.mediaType, item.id, {
                    episodeIndex: latestTmdbHistory.episodeIndex,
                    seasonNumber:
                      item.mediaType === 'tv'
                        ? latestTmdbHistory.tmdbSeasonNumber ?? undefined
                        : undefined,
                  })
              : ''
            const playNowLabel = continueWatchingPath ? '从头播放' : '立即播放'

            return (
              <CarouselItem key={`${item.mediaType}-${item.id}`} className="h-fit rounded-lg">
                <AspectRatio
                  ratio={getAspectRatio()}
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
                    className={`absolute inset-0 flex min-h-0 flex-col justify-end rounded-lg bg-gradient-to-t from-black/90 via-black/50 via-60% to-transparent px-6 pt-4 pb-6 transition-opacity duration-500 ease-out md:px-8 md:pb-8 lg:hidden ${isActive ? 'opacity-100' : 'opacity-0'} `}
                  >
                    {/* Logo图片或标题文字 - 移动端/平板 */}
                    <div
                      className={`mb-3 flex shrink-0 items-end transition-all delay-100 duration-500 ease-out md:mb-4 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} `}
                    >
                      {item.logoPath ? (
                        <img
                          src={getLogoUrl(item.logoPath)}
                          alt={item.title}
                          className="max-h-12 max-w-[180px] object-contain md:max-h-16 md:max-w-[240px]"
                        />
                      ) : (
                        <h2 className="text-xl font-bold text-white md:text-2xl">{item.title}</h2>
                      )}
                    </div>

                    {/* 介绍 - 移动端/平板，使用min-h-0允许收缩 */}
                    <p
                      className={`mb-2 line-clamp-2 min-h-0 shrink text-xs text-white/80 transition-all delay-150 duration-500 ease-out md:mb-4 md:line-clamp-3 md:max-w-md md:text-sm ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} `}
                    >
                      {item.overview}
                    </p>

                    {/* 按钮组 - 移动端/平板 */}
                    <div
                      className={`shrink-0 transition-all delay-200 duration-500 ease-out ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} `}
                    >
                      {isMobile ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="h-7 min-w-0 flex-1 gap-1 rounded-full bg-[#E50914] px-2.5 text-xs font-semibold text-white hover:bg-[#ca0812]"
                            onClick={() => navigate(continueWatchingPath || playPath)}
                          >
                            <Play className="size-3.5 fill-current" />
                            {continueWatchingPath ? '继续观看' : playNowLabel}
                          </Button>

                          {continueWatchingPath ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-7 shrink-0 gap-1 rounded-full bg-white/30 px-2.5 text-xs font-semibold text-white hover:bg-white/40"
                                >
                                  <MoreHorizontal className="size-3.5" />
                                  更多
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36">
                                <DropdownMenuItem onClick={() => navigate(playPath)}>
                                  <Play className="size-3.5" />
                                  {playNowLabel}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(detailPath)}>
                                  <Info className="size-3.5" />
                                  查看详情
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-7 shrink-0 gap-1 rounded-full bg-white/30 px-2.5 text-xs font-semibold text-white hover:bg-white/40"
                              onClick={() => navigate(detailPath)}
                            >
                              <Info className="size-3.5" />
                              详情
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 md:gap-3">
                          {continueWatchingPath ? (
                            <Button
                              asChild
                              size="sm"
                              className="group relative h-8 rounded-full gap-1.5 bg-[#E50914] px-3 font-semibold text-white hover:bg-[#ca0812] md:h-9 md:gap-2 md:px-4 md:text-sm"
                            >
                              <NavLink to={continueWatchingPath} className="relative inline-flex">
                                <span className="inline-flex items-center gap-1.5 transition-opacity duration-200 group-hover:opacity-0 md:gap-2">
                                  <Play className="size-3.5 fill-current md:size-4" />
                                  继续观看
                                  {continueWatchingLabel ? (
                                    <span className="hidden md:inline">· {continueWatchingLabel}</span>
                                  ) : null}
                                </span>
                                {continueWatchingProgressLabel ? (
                                  <span className="pointer-events-none absolute inset-0 hidden items-center justify-center text-[11px] font-semibold opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:flex">
                                    {continueWatchingProgressLabel}
                                  </span>
                                ) : null}
                              </NavLink>
                            </Button>
                          ) : null}

                          <Button
                            asChild
                            size="sm"
                            className="h-8 rounded-full gap-1.5 bg-white px-3 font-semibold text-black hover:bg-white/90 md:h-9 md:gap-2 md:px-4 md:text-sm"
                          >
                            <NavLink to={playPath}>
                              <Play className="size-3.5 fill-current md:size-4" />
                              {playNowLabel}
                            </NavLink>
                          </Button>

                          <Button
                            asChild
                            size="sm"
                            variant="secondary"
                            className="h-8 rounded-full gap-1.5 bg-white/30 px-3 font-semibold text-white hover:bg-white/40 md:h-9 md:gap-2 md:px-4 md:text-sm"
                          >
                            <NavLink to={detailPath}>
                              <Info className="size-3.5 md:size-4" />
                              查看详情
                            </NavLink>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 遮罩层 - 桌面端Netflix风格从左到右渐变 */}
                  <div
                    className={`absolute inset-0 hidden flex-col justify-end rounded-lg bg-gradient-to-r from-black/90 via-black/50 via-40% to-transparent px-16 pt-25 pb-16 transition-opacity duration-500 ease-out lg:flex ${isActive ? 'opacity-100' : 'opacity-0'} `}
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
                      {continueWatchingPath ? (
                        <Button
                          asChild
                          size="lg"
                          className="group relative rounded-full gap-2 bg-[#E50914] font-semibold text-white hover:bg-[#ca0812]"
                        >
                          <NavLink to={continueWatchingPath} className="relative inline-flex">
                            <span className="inline-flex items-center gap-2 transition-opacity duration-200 group-hover:opacity-0">
                              <Play className="size-5 fill-current" />
                              继续观看
                              {continueWatchingLabel ? <span>· {continueWatchingLabel}</span> : null}
                            </span>
                            {continueWatchingProgressLabel ? (
                              <span className="pointer-events-none absolute inset-0 hidden items-center justify-center text-xs font-semibold opacity-0 transition-opacity duration-200 group-hover:opacity-100 xl:flex">
                                {continueWatchingProgressLabel}
                              </span>
                            ) : null}
                          </NavLink>
                        </Button>
                      ) : null}
                      <Button
                        asChild
                        size="lg"
                        className="rounded-full gap-2 bg-white font-semibold text-black hover:bg-white/90"
                      >
                        <NavLink to={playPath}>
                          <Play className="size-5 fill-current" />
                          {playNowLabel}
                        </NavLink>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        variant="secondary"
                        className="rounded-full gap-2 bg-white/30 font-semibold text-white hover:bg-white/40"
                      >
                        <NavLink to={detailPath}>
                          <Info className="size-5" />
                          查看详情
                        </NavLink>
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
