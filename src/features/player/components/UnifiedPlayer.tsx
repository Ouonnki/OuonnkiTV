import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import Artplayer from 'artplayer'
import type Hls from 'hls.js'
import type { HlsConfig } from 'hls.js'
import { ChevronDown } from 'lucide-react'
import { type DetailResult } from '@ouonnki/cms-core'
import { createM3u8Processor, createHlsLoaderClass } from '@ouonnki/cms-core/m3u8'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible'
import { Spinner } from '@/shared/components/ui/spinner'
import { useApiStore } from '@/shared/store/apiStore'
import { useViewingHistoryStore } from '@/shared/store/viewingHistoryStore'
import { useSettingStore } from '@/shared/store/settingStore'
import { useDocumentTitle, useCmsClient } from '@/shared/hooks'
import { cn } from '@/shared/lib/utils'
import { buildCmsPlayPath, buildTmdbDetailPath, buildTmdbPlayPath } from '@/shared/lib/routes'
import { isTmdbHistoryItem } from '@/shared/lib/viewingHistory'
import { getBackdropUrl } from '@/shared/lib/tmdb'
import { useFavoritesStore } from '@/features/favorites/store/favoritesStore'
import type { TmdbMediaItem, TmdbMediaType } from '@/shared/types/tmdb'
import type { ViewingHistoryItem } from '@/shared/types'
import type { VideoItem } from '@/shared/types/video'
import { useTmdbRecommendations } from '@/shared/hooks/useTmdb'
import { toast } from 'sonner'
import _ from 'lodash'
import {
  PlayerEpisodePanel,
  PlayerHeroSection,
  PlayerInfoAndRecommendations,
  PlayerLoadingSkeleton,
} from '@/features/player/components'
import { useEpisodePagination, useTmdbPlayback } from '@/features/player/hooks'

interface ArtplayerWithHls extends Artplayer {
  hls?: Hls
}

interface PlayerRouteParams {
  [key: string]: string | undefined
  type?: string
  tmdbId?: string
  sourceCode?: string
  vodId?: string
}

const isSupportedMediaType = (value: string): value is TmdbMediaType => value === 'movie' || value === 'tv'

const m3u8Processor = createM3u8Processor({ filterAds: true })
type HlsConstructor = typeof import('hls.js')['default']

let hlsConstructorPromise: Promise<HlsConstructor> | null = null
let customHlsLoaderClass: ReturnType<typeof createHlsLoaderClass> | null = null

const getHlsConstructor = async (): Promise<HlsConstructor> => {
  if (!hlsConstructorPromise) {
    hlsConstructorPromise = import('hls.js/dist/hls.light.mjs')
      .then(module => module.default as HlsConstructor)
      .catch(error => {
        hlsConstructorPromise = null
        throw error
      })
  }

  return hlsConstructorPromise
}

const getCustomHlsLoaderClass = (HlsClass: HlsConstructor) => {
  if (!customHlsLoaderClass) {
    customHlsLoaderClass = createHlsLoaderClass({
      m3u8Processor,
      Hls: HlsClass,
    })
  }

  return customHlsLoaderClass
}

const parseEpisodeIndex = (value: string | null): number => {
  const parsed = Number.parseInt(value || '0', 10)
  return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed
}

const parsePositiveNumber = (value: string | null): number | null => {
  const parsed = Number.parseInt(value || '', 10)
  if (Number.isNaN(parsed) || parsed <= 0) {
    return null
  }
  return parsed
}

const stripHtmlTags = (value: string) => {
  const stripped = value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()

  return stripped
}

const matchesTmdbHistory = (
  item: ViewingHistoryItem,
  mediaType: TmdbMediaType,
  tmdbId: number,
  seasonNumber: number | null,
) => {
  if (!isTmdbHistoryItem(item)) return false
  if (item.tmdbMediaType !== mediaType || item.tmdbId !== tmdbId) return false
  if (mediaType === 'tv') {
    return (item.tmdbSeasonNumber ?? null) === seasonNumber
  }
  return true
}

export default function UnifiedPlayer() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { type = '', tmdbId = '', sourceCode: routeSourceCode = '', vodId: routeVodId = '' } =
    useParams<PlayerRouteParams>()

  const cmsClient = useCmsClient()
  const { videoAPIs, adFilteringEnabled } = useApiStore()
  const { addViewingHistory, viewingHistory } = useViewingHistoryStore()
  const { playback } = useSettingStore()

  const viewingHistoryRef = useRef(viewingHistory)
  const playbackRef = useRef(playback)
  const detailRef = useRef<DetailResult | null>(null)
  const pendingSeekRef = useRef<number | null>(null)

  useEffect(() => {
    viewingHistoryRef.current = viewingHistory
    playbackRef.current = playback
  }, [playback, viewingHistory])

  const querySourceCode = searchParams.get('source') || ''
  const queryVodId = searchParams.get('id') || ''
  const querySeasonNumber = parsePositiveNumber(searchParams.get('season'))
  const episodeIndexParam = searchParams.get('ep')

  const isTmdbRoute = Boolean(type && tmdbId)
  const isCmsRoute = Boolean(routeSourceCode && routeVodId)
  const tmdbMediaType = isSupportedMediaType(type) ? type : null
  const parsedTmdbId = Number.parseInt(tmdbId, 10)

  const tmdbPlayback = useTmdbPlayback({
    enabled: isTmdbRoute,
    mediaType: tmdbMediaType,
    tmdbId: Number.isInteger(parsedTmdbId) ? parsedTmdbId : 0,
    querySourceCode,
    querySeasonNumber,
  })

  const { recommendations: fallbackRecommendations } = useTmdbRecommendations()
  const toggleCmsFavorite = useFavoritesStore(state => state.toggleCmsFavorite)
  const toggleTmdbFavorite = useFavoritesStore(state => state.toggleTmdbFavorite)

  const [detail, setDetail] = useState<DetailResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDetailRefreshing, setIsDetailRefreshing] = useState(false)
  const [playerNotice, setPlayerNotice] = useState('')
  const [playerNoticeProgress, setPlayerNoticeProgress] = useState(0)
  const [playerNoticeDuration, setPlayerNoticeDuration] = useState(2200)
  const [activeRightPanel, setActiveRightPanel] = useState<'episode' | 'source' | 'season' | null>('episode')
  const selectedEpisode = parseEpisodeIndex(episodeIndexParam)
  const playerNoticeTimerRef = useRef<number | null>(null)
  const playerNoticeAnimationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    detailRef.current = detail
  }, [detail])

  const showPlayerNotice = useCallback((message: string, duration = 2200) => {
    setPlayerNotice(message)
    setPlayerNoticeDuration(duration)
    setPlayerNoticeProgress(100)

    if (playerNoticeTimerRef.current) {
      window.clearTimeout(playerNoticeTimerRef.current)
    }
    if (playerNoticeAnimationFrameRef.current) {
      window.cancelAnimationFrame(playerNoticeAnimationFrameRef.current)
    }

    playerNoticeAnimationFrameRef.current = window.requestAnimationFrame(() => {
      playerNoticeAnimationFrameRef.current = window.requestAnimationFrame(() => {
        setPlayerNoticeProgress(0)
        playerNoticeAnimationFrameRef.current = null
      })
    })

    playerNoticeTimerRef.current = window.setTimeout(() => {
      setPlayerNotice('')
      setPlayerNoticeProgress(0)
      playerNoticeTimerRef.current = null
    }, duration)
  }, [])

  useEffect(() => {
    return () => {
      if (playerNoticeTimerRef.current) {
        window.clearTimeout(playerNoticeTimerRef.current)
      }
      if (playerNoticeAnimationFrameRef.current) {
        window.cancelAnimationFrame(playerNoticeAnimationFrameRef.current)
      }
    }
  }, [])

  const resolvedSourceCode = isCmsRoute ? routeSourceCode : tmdbPlayback.resolvedSourceCode
  const resolvedVodId = isCmsRoute ? routeVodId : tmdbPlayback.resolvedVodId
  const canUseTmdbHistory = Boolean(
    isTmdbRoute && tmdbMediaType && Number.isInteger(parsedTmdbId) && parsedTmdbId > 0,
  )
  const tmdbSeasonNumberForHistory =
    tmdbMediaType === 'tv' ? (tmdbPlayback.selectedSeasonNumber ?? querySeasonNumber ?? null) : null
  const cmsFavoriteActive = useFavoritesStore(state =>
    isCmsRoute && resolvedVodId && resolvedSourceCode
      ? state.isCmsFavorited(resolvedVodId, resolvedSourceCode)
      : false,
  )
  const tmdbFavoriteActive = useFavoritesStore(state =>
    isTmdbRoute && tmdbMediaType && parsedTmdbId > 0
      ? state.isTmdbFavorited(parsedTmdbId, tmdbMediaType)
      : false,
  )

  const sourceConfig = useMemo(
    () => videoAPIs.find(api => api.id === resolvedSourceCode),
    [resolvedSourceCode, videoAPIs],
  )

  const buildCurrentPlayPath = useCallback(
    (
      episodeIndex: number,
      options?: {
        sourceCode?: string
        vodId?: string
        seasonNumber?: number
      },
    ) => {
      if (isCmsRoute) {
        return buildCmsPlayPath(routeSourceCode, routeVodId, episodeIndex)
      }

      if (isTmdbRoute && tmdbMediaType) {
        return buildTmdbPlayPath(tmdbMediaType, tmdbId, {
          sourceCode: options?.sourceCode || resolvedSourceCode,
          vodId: options?.vodId || resolvedVodId,
          episodeIndex,
          seasonNumber: options?.seasonNumber ?? tmdbPlayback.selectedSeasonNumber ?? undefined,
        })
      }

      return buildCmsPlayPath(resolvedSourceCode, resolvedVodId, episodeIndex)
    },
    [
      isCmsRoute,
      isTmdbRoute,
      resolvedSourceCode,
      resolvedVodId,
      routeSourceCode,
      routeVodId,
      tmdbId,
      tmdbMediaType,
      tmdbPlayback.selectedSeasonNumber,
    ],
  )

  useEffect(() => {
    if (!location.pathname.startsWith('/play/')) return
    if (!isTmdbRoute || !tmdbMediaType) return
    if (tmdbPlayback.tmdbLoading || tmdbPlayback.playlist.loading) return
    if (!tmdbPlayback.playlist.searched) return

    if (!tmdbPlayback.resolvedSourceCode || !tmdbPlayback.resolvedVodId) return

    const currentSeason = parsePositiveNumber(searchParams.get('season'))
    const targetSeason = tmdbPlayback.selectedSeasonNumber || null
    const episodeFromUrl = parseEpisodeIndex(episodeIndexParam)

    const sourceUnchanged = querySourceCode === tmdbPlayback.resolvedSourceCode
    const vodUnchanged = queryVodId === tmdbPlayback.resolvedVodId
    const seasonUnchanged = currentSeason === targetSeason

    if (sourceUnchanged && vodUnchanged && seasonUnchanged) return

    navigate(
      buildTmdbPlayPath(tmdbMediaType, tmdbId, {
        sourceCode: tmdbPlayback.resolvedSourceCode,
        vodId: tmdbPlayback.resolvedVodId,
        episodeIndex: episodeFromUrl,
        seasonNumber: targetSeason || undefined,
      }),
      { replace: true },
    )
  }, [
    isTmdbRoute,
    querySourceCode,
    queryVodId,
    episodeIndexParam,
    location.pathname,
    navigate,
    searchParams,
    tmdbId,
    tmdbMediaType,
    tmdbPlayback.playlist.loading,
    tmdbPlayback.playlist.searched,
    tmdbPlayback.resolvedSourceCode,
    tmdbPlayback.resolvedVodId,
    tmdbPlayback.selectedSeasonNumber,
    tmdbPlayback.tmdbLoading,
  ])

  useEffect(() => {
    const fetchVideoDetail = async () => {
      if (!resolvedSourceCode || !resolvedVodId) {
        if (isTmdbRoute && (tmdbPlayback.tmdbLoading || tmdbPlayback.playlist.loading)) {
          if (!detailRef.current) {
            setLoading(true)
          }
          setIsDetailRefreshing(Boolean(detailRef.current))
          setError(null)
          return
        }

        if (isTmdbRoute && tmdbPlayback.playlist.searched) {
          if (!detailRef.current) {
            setLoading(false)
            setDetail(null)
          }
          setIsDetailRefreshing(false)
          setError('没有匹配到可播放资源，请返回详情页重新匹配')
          return
        }

        if (!detailRef.current) {
          setLoading(false)
          setDetail(null)
        }
        setIsDetailRefreshing(false)
        setError('缺少必要的播放参数')
        return
      }

      if (detailRef.current) {
        setIsDetailRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      try {
        if (!sourceConfig) {
          throw new Error('未找到对应视频源配置，请检查源设置')
        }

        const response = await cmsClient.getDetail(resolvedVodId, sourceConfig)
        if (response.success && response.episodes && response.episodes.length > 0) {
          setDetail(response)
          return
        }

        throw new Error(response.error || '获取视频详情失败')
      } catch (fetchError) {
        console.error('获取视频详情失败:', fetchError)
        if (!detailRef.current) {
          setDetail(null)
        }
        setError(fetchError instanceof Error ? fetchError.message : '获取视频详情失败')
      } finally {
        setLoading(false)
        setIsDetailRefreshing(false)
      }
    }

    fetchVideoDetail()
  }, [
    cmsClient,
    isTmdbRoute,
    resolvedSourceCode,
    resolvedVodId,
    sourceConfig,
    tmdbPlayback.playlist.loading,
    tmdbPlayback.playlist.searched,
    tmdbPlayback.tmdbLoading,
  ])

  const episodes = useMemo(() => {
    if (!detail) return []

    if (detail.videoInfo?.episodes_names && detail.videoInfo.episodes_names.length > 0) {
      return detail.videoInfo.episodes_names
    }

    return detail.episodes.map((_, index) => `第 ${index + 1} 集`)
  }, [detail])

  useEffect(() => {
    if (episodes.length === 0) return
    if (selectedEpisode < episodes.length) return

    const nextEpisode = 0
    navigate(buildCurrentPlayPath(nextEpisode), { replace: true })
  }, [buildCurrentPlayPath, episodes.length, navigate, selectedEpisode])

  const episodePagination = useEpisodePagination({
    episodes,
    selectedEpisode,
    defaultDescOrder: playback.defaultEpisodeOrder === 'desc',
  })

  const episodeProgressMap = useMemo(() => {
    if (!playback.isViewingHistoryVisible || !resolvedSourceCode || !resolvedVodId) return null

    const appendProgress = (
      targetMap: Map<number, { progress: number; timestamp: number }>,
      item: ViewingHistoryItem,
    ) => {
      const progress =
        item.duration > 0 ? Math.min(100, Math.max(0, (item.playbackPosition / item.duration) * 100)) : 0
      const previous = targetMap.get(item.episodeIndex)

      if (!previous || item.timestamp > previous.timestamp) {
        targetMap.set(item.episodeIndex, { progress, timestamp: item.timestamp })
      }
    }

    if (canUseTmdbHistory && tmdbMediaType) {
      const tmdbMap = new Map<number, { progress: number; timestamp: number }>()
      const cmsFallbackMap = new Map<number, { progress: number; timestamp: number }>()

      for (const item of viewingHistory) {
        if (matchesTmdbHistory(item, tmdbMediaType, parsedTmdbId, tmdbSeasonNumberForHistory)) {
          appendProgress(tmdbMap, item)
          continue
        }

        if (
          item.recordType === 'cms' &&
          item.sourceCode === resolvedSourceCode &&
          item.vodId === resolvedVodId
        ) {
          appendProgress(cmsFallbackMap, item)
        }
      }

      const merged = new Map<number, number>()
      tmdbMap.forEach((value, episodeIndex) => {
        merged.set(episodeIndex, value.progress)
      })
      cmsFallbackMap.forEach((value, episodeIndex) => {
        if (!merged.has(episodeIndex)) {
          merged.set(episodeIndex, value.progress)
        }
      })

      return merged
    }

    const map = new Map<number, { progress: number; timestamp: number }>()
    for (const item of viewingHistory) {
      if (item.sourceCode === resolvedSourceCode && item.vodId === resolvedVodId) {
        appendProgress(map, item)
      }
    }

    const normalized = new Map<number, number>()
    map.forEach((value, episodeIndex) => {
      normalized.set(episodeIndex, value.progress)
    })
    return normalized
  }, [
    canUseTmdbHistory,
    parsedTmdbId,
    playback.isViewingHistoryVisible,
    resolvedSourceCode,
    resolvedVodId,
    tmdbMediaType,
    tmdbSeasonNumberForHistory,
    viewingHistory,
  ])

  const playerRef = useRef<Artplayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!detail?.episodes || !detail.episodes[selectedEpisode] || !containerRef.current) return

    if (playerRef.current && playerRef.current.destroy) {
      playerRef.current.destroy(false)
    }

    const isMobileViewport = window.matchMedia('(max-width: 639px)').matches

    const nextEpisode = () => {
      if (!playbackRef.current.isAutoPlayEnabled) return

      if (selectedEpisode < episodes.length - 1) {
        const nextIndex = selectedEpisode + 1
        navigate(buildCurrentPlayPath(nextIndex), { replace: true })
        showPlayerNotice(`即将播放下一集: ${episodes[nextIndex]}`)
      }
    }

    const art = new Artplayer({
      container: containerRef.current,
      url: detail.episodes[selectedEpisode],
      volume: playbackRef.current.defaultVolume,
      isLive: false,
      muted: false,
      autoplay: false,
      pip: playbackRef.current.isPipEnabled,
      autoSize: false,
      autoMini: false, // 内置 autoMini 监听 window.scroll，在 ScrollArea 布局下失效，改用手动实现
      screenshot: playbackRef.current.isScreenshotEnabled,
      setting: true,
      loop: playbackRef.current.isLoopEnabled,
      flip: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: !isMobileViewport,
      subtitleOffset: true,
      miniProgressBar: true,
      mutex: true,
      backdrop: true,
      playsInline: true,
      airplay: !isMobileViewport,
      theme: playbackRef.current.playerThemeColor,
      lang: 'zh-cn',
      moreVideoAttr: {
        crossOrigin: 'anonymous',
      },
      customType: {
        m3u8: function (video: HTMLMediaElement, url: string, art: Artplayer) {
          const artWithHls = art as ArtplayerWithHls
          void (async () => {
            try {
              const HlsClass = await getHlsConstructor()
              if (playerRef.current !== art) return

              if (HlsClass.isSupported()) {
                if (artWithHls.hls) artWithHls.hls.destroy()
                const hlsConfig: Partial<HlsConfig> = adFilteringEnabled
                  ? {
                      loader: getCustomHlsLoaderClass(HlsClass) as unknown as typeof HlsClass.DefaultConfig.loader,
                    }
                  : {}
                const hls = new HlsClass(hlsConfig)
                hls.loadSource(url)
                hls.attachMedia(video)
                artWithHls.hls = hls
                art.on('destroy', () => hls.destroy())
              } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url
              } else {
                art.notice.show = 'Unsupported playback format: m3u8'
              }
            } catch (loadError) {
              console.error('加载 HLS 播放内核失败:', loadError)
              if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url
              } else {
                art.notice.show = '播放内核加载失败，请稍后重试'
              }
            }
          })()
        },
      },
    })

    playerRef.current = art

    art.on('ready', () => {
      if (art.video) {
        art.video.style.objectFit = 'contain'
        art.video.style.objectPosition = 'center center'
        art.video.style.background = '#000'
      }

      let existingHistory: ViewingHistoryItem | undefined

      if (canUseTmdbHistory && tmdbMediaType) {
        existingHistory = viewingHistoryRef.current.find(
          item =>
            item.episodeIndex === selectedEpisode &&
            matchesTmdbHistory(item, tmdbMediaType, parsedTmdbId, tmdbSeasonNumberForHistory),
        )

        if (!existingHistory) {
          existingHistory = viewingHistoryRef.current.find(
            item =>
              item.recordType === 'cms' &&
              item.sourceCode === resolvedSourceCode &&
              item.vodId === resolvedVodId &&
              item.episodeIndex === selectedEpisode,
          )
        }
      } else {
        existingHistory = viewingHistoryRef.current.find(
          item =>
            item.sourceCode === resolvedSourceCode &&
            item.vodId === resolvedVodId &&
            item.episodeIndex === selectedEpisode,
        )
      }

      if (pendingSeekRef.current && pendingSeekRef.current > 0) {
        art.seek = pendingSeekRef.current
        pendingSeekRef.current = null
        showPlayerNotice('已继承上一个源的播放进度')
      } else if (existingHistory && existingHistory.playbackPosition > 0) {
        art.seek = existingHistory.playbackPosition
        showPlayerNotice('已自动跳转到上次观看位置')
      }
    })

    const addHistorySnapshot = () => {
      if (!resolvedSourceCode || !resolvedVodId || !detail.videoInfo) return
      const historyImageUrl =
        (canUseTmdbHistory
          ? getBackdropUrl(tmdbPlayback.tmdbDetail?.backdropPath || null, 'w1280')
          : '') ||
        detail.videoInfo.cover ||
        ''
      addViewingHistory({
        recordType: canUseTmdbHistory ? 'tmdb' : 'cms',
        title: detail.videoInfo.title || '未知视频',
        imageUrl: historyImageUrl,
        sourceCode: resolvedSourceCode,
        sourceName: detail.videoInfo.source_name || '',
        vodId: resolvedVodId,
        tmdbMediaType: canUseTmdbHistory ? tmdbMediaType || undefined : undefined,
        tmdbId: canUseTmdbHistory ? parsedTmdbId : undefined,
        tmdbSeasonNumber:
          canUseTmdbHistory && tmdbMediaType === 'tv' ? tmdbSeasonNumberForHistory : undefined,
        episodeIndex: selectedEpisode,
        episodeName: episodes[selectedEpisode],
        playbackPosition: art.currentTime || 0,
        duration: art.duration || 0,
        timestamp: Date.now(),
      })
    }

    art.on('video:play', addHistorySnapshot)
    art.on('video:pause', addHistorySnapshot)
    art.on('video:ended', () => {
      addHistorySnapshot()
      nextEpisode()
    })
    art.on('video:error', addHistorySnapshot)

    let lastTimeUpdate = 0
    const TIME_UPDATE_INTERVAL = 3000

    const timeUpdateHandler = () => {
      if (!resolvedSourceCode || !resolvedVodId || !detail.videoInfo) return
      const currentTime = art.currentTime || 0
      const duration = art.duration || 0
      const timeSinceLastUpdate = Date.now() - lastTimeUpdate

      if (timeSinceLastUpdate >= TIME_UPDATE_INTERVAL && currentTime > 0 && duration > 0) {
        lastTimeUpdate = Date.now()
        const historyImageUrl =
          (canUseTmdbHistory
            ? getBackdropUrl(tmdbPlayback.tmdbDetail?.backdropPath || null, 'w1280')
            : '') ||
          detail.videoInfo.cover ||
          ''
        addViewingHistory({
          recordType: canUseTmdbHistory ? 'tmdb' : 'cms',
          title: detail.videoInfo.title || '未知视频',
          imageUrl: historyImageUrl,
          sourceCode: resolvedSourceCode,
          sourceName: detail.videoInfo.source_name || '',
          vodId: resolvedVodId,
          tmdbMediaType: canUseTmdbHistory ? tmdbMediaType || undefined : undefined,
          tmdbId: canUseTmdbHistory ? parsedTmdbId : undefined,
          tmdbSeasonNumber:
            canUseTmdbHistory && tmdbMediaType === 'tv' ? tmdbSeasonNumberForHistory : undefined,
          episodeIndex: selectedEpisode,
          episodeName: episodes[selectedEpisode],
          playbackPosition: currentTime,
          duration,
          timestamp: Date.now(),
        })
      }
    }

    const throttledTimeUpdate = _.throttle(timeUpdateHandler, TIME_UPDATE_INTERVAL)
    art.on('video:timeupdate', throttledTimeUpdate)

    // 手动实现 autoMini：Artplayer 内置 autoMini 监听 window.scroll，
    // 但应用使用 Radix ScrollArea 管理滚动，window.scroll 永远不触发。
    // 这里监听 ScrollArea viewport 的 scroll 事件，手动切换 art.mini。
    let miniCleanup: (() => void) | undefined
    if (playbackRef.current.isAutoMiniEnabled && containerRef.current) {
      const scrollViewport = document.querySelector(
        '[data-main-scroll-area] [data-slot="scroll-area-viewport"]',
      ) as HTMLElement | null
      const playerSection = containerRef.current.closest('section')

      if (scrollViewport && playerSection) {
        let isMini = false
        let hasSetInitialPosition = false
        const VISIBILITY_GAP = 50

        const checkVisibility = _.throttle(() => {
          if (!playerRef.current) return

          const scrollRect = scrollViewport.getBoundingClientRect()
          const sectionRect = playerSection.getBoundingClientRect()

          // section 底部在滚动区域顶部以下且 section 顶部在滚动区域底部以上，则可见
          const isVisible =
            sectionRect.bottom > scrollRect.top + VISIBILITY_GAP &&
            sectionRect.top < scrollRect.bottom - VISIBILITY_GAP

          if (!isVisible && !isMini) {
            // 进入迷你模式前固定 section 高度，防止 fixed 定位导致布局塌陷
            playerSection.style.minHeight = `${sectionRect.height}px`
            isMini = true
            playerRef.current.mini = true

            // 首次进入迷你模式时，根据屏幕尺寸设置初始位置和大小
            // 移动端/平板端：右上角（导航栏下方），缩小尺寸
            // 桌面端：右下角（回到顶部按钮上方），默认尺寸
            if (!hasSetInitialPosition) {
              hasSetInitialPosition = true
              requestAnimationFrame(() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const miniEl = (playerRef.current as any)?.template?.$mini as
                  | HTMLElement
                  | undefined
                if (!miniEl) return

                const isMobile = window.matchMedia('(max-width: 639px)').matches
                const isTablet = window.matchMedia(
                  '(min-width: 640px) and (max-width: 1023px)',
                ).matches

                if (isMobile || isTablet) {
                  // 移动端/平板端：右上角，导航栏高度 64px + 8px 间距
                  const miniWidth = isMobile ? 240 : 280
                  const miniHeight = isMobile ? 135 : 158
                  const topGap = 72
                  const rightGap = isMobile ? 12 : 16

                  miniEl.style.width = `${miniWidth}px`
                  miniEl.style.height = `${miniHeight}px`
                  miniEl.style.top = `${topGap}px`
                  miniEl.style.left = `${window.innerWidth - miniWidth - rightGap}px`
                } else {
                  // 桌面端：右下角，回到顶部按钮上方
                  const miniRect = miniEl.getBoundingClientRect()
                  const bottomGap = 100
                  const rightGap = 50
                  miniEl.style.top = `${window.innerHeight - miniRect.height - bottomGap}px`
                  miniEl.style.left = `${window.innerWidth - miniRect.width - rightGap}px`
                }
              })
            }
          } else if (isVisible && isMini) {
            isMini = false
            playerRef.current.mini = false
            playerSection.style.minHeight = ''
          }
        }, 200)

        scrollViewport.addEventListener('scroll', checkVisibility, { passive: true })

        miniCleanup = () => {
          checkVisibility.cancel()
          scrollViewport.removeEventListener('scroll', checkVisibility)
          if (playerRef.current) {
            playerRef.current.mini = false
          }
          playerSection.style.minHeight = ''
        }
      }
    }

    return () => {
      miniCleanup?.()
      throttledTimeUpdate.cancel()
      if (playerRef.current && playerRef.current.destroy) {
        addHistorySnapshot()
        playerRef.current.destroy(false)
        playerRef.current = null
      }
    }
  }, [
    addViewingHistory,
    adFilteringEnabled,
    buildCurrentPlayPath,
    canUseTmdbHistory,
    detail,
    episodes,
    navigate,
    parsedTmdbId,
    resolvedSourceCode,
    resolvedVodId,
    selectedEpisode,
    showPlayerNotice,
    tmdbPlayback.tmdbDetail?.backdropPath,
    tmdbMediaType,
    tmdbSeasonNumberForHistory,
  ])

  const handleEpisodeChange = (displayIndex: number) => {
    pendingSeekRef.current = null
    const actualIndex = episodePagination.toActualIndex(displayIndex)
    if (actualIndex === selectedEpisode) return
    navigate(buildCurrentPlayPath(actualIndex), { replace: true })
  }

  const handleSourceChange = (sourceCode: string) => {
    if (!isTmdbRoute || !tmdbMediaType) return

    const nextOption = tmdbPlayback.sourceOptions.find(option => option.sourceCode === sourceCode)
    if (!nextOption || !nextOption.bestVodId) return

    pendingSeekRef.current = playerRef.current?.currentTime || null

    const nextPath = buildTmdbPlayPath(tmdbMediaType, tmdbId, {
      sourceCode: nextOption.sourceCode,
      vodId: nextOption.bestVodId,
      episodeIndex: selectedEpisode,
      seasonNumber: tmdbPlayback.selectedSeasonNumber || undefined,
    })

    navigate(nextPath, { replace: true })
    showPlayerNotice(`已切换到 ${nextOption.sourceName}`)
  }

  const handleSeasonChange = (seasonNumber: number) => {
    if (!isTmdbRoute || tmdbMediaType !== 'tv') return

    pendingSeekRef.current = null

    const seasonSourceOptions = tmdbPlayback.getSourceOptionsForSeason(seasonNumber)
    if (seasonSourceOptions.length === 0) {
      showPlayerNotice('该季暂无可用源')
      return
    }

    const preferredSource =
      seasonSourceOptions.find(option => option.sourceCode === resolvedSourceCode) || seasonSourceOptions[0]

    const nextPath = buildTmdbPlayPath('tv', tmdbId, {
      sourceCode: preferredSource.sourceCode,
      vodId: preferredSource.bestVodId,
      episodeIndex: 0,
      seasonNumber,
    })

    navigate(nextPath, { replace: true })
  }

  const handleToggleCmsFavorite = useCallback(() => {
    if (!isCmsRoute || !resolvedVodId || !resolvedSourceCode) return

    const video: VideoItem = {
      vod_id: resolvedVodId,
      vod_name: detail?.videoInfo?.title || '未知视频',
      vod_pic: detail?.videoInfo?.cover,
      vod_year: detail?.videoInfo?.year,
      vod_area: detail?.videoInfo?.area,
      vod_remarks: detail?.videoInfo?.remarks,
      vod_content: detail?.videoInfo?.desc,
      type_name: detail?.videoInfo?.type,
      source_code: resolvedSourceCode,
      source_name: detail?.videoInfo?.source_name || '',
    }

    toggleCmsFavorite(video)
    toast.success(cmsFavoriteActive ? '已取消收藏' : '已加入收藏')
  }, [
    cmsFavoriteActive,
    detail?.videoInfo?.area,
    detail?.videoInfo?.cover,
    detail?.videoInfo?.desc,
    detail?.videoInfo?.remarks,
    detail?.videoInfo?.source_name,
    detail?.videoInfo?.title,
    detail?.videoInfo?.type,
    detail?.videoInfo?.year,
    isCmsRoute,
    resolvedSourceCode,
    resolvedVodId,
    toggleCmsFavorite,
  ])

  const handleToggleTmdbFavorite = useCallback(() => {
    if (!isTmdbRoute || !tmdbMediaType || parsedTmdbId <= 0) return

    const tmdbMedia: TmdbMediaItem = {
      id: parsedTmdbId,
      mediaType: tmdbMediaType,
      title: tmdbPlayback.tmdbDetail?.title || '未知视频',
      originalTitle: tmdbPlayback.tmdbDetail?.originalTitle || tmdbPlayback.tmdbDetail?.title || '未知视频',
      overview: tmdbPlayback.tmdbDetail?.overview || '',
      posterPath: tmdbPlayback.tmdbDetail?.posterPath || null,
      backdropPath: tmdbPlayback.tmdbDetail?.backdropPath || null,
      logoPath: tmdbPlayback.tmdbDetail?.logoPath || null,
      releaseDate: tmdbPlayback.tmdbDetail?.releaseDate || '',
      voteAverage: tmdbPlayback.tmdbDetail?.voteAverage || 0,
      voteCount: tmdbPlayback.tmdbDetail?.voteCount || 0,
      popularity: tmdbPlayback.tmdbDetail?.popularity || 0,
      genreIds: tmdbPlayback.tmdbDetail?.genreIds || [],
      originalLanguage: tmdbPlayback.tmdbDetail?.originalLanguage || '',
      originCountry: tmdbPlayback.tmdbDetail?.originCountry || [],
    }

    toggleTmdbFavorite(tmdbMedia)
    toast.success(tmdbFavoriteActive ? '已取消收藏' : '已加入收藏')
  }, [
    isTmdbRoute,
    parsedTmdbId,
    tmdbFavoriteActive,
    tmdbMediaType,
    tmdbPlayback.tmdbDetail?.backdropPath,
    tmdbPlayback.tmdbDetail?.genreIds,
    tmdbPlayback.tmdbDetail?.logoPath,
    tmdbPlayback.tmdbDetail?.originalLanguage,
    tmdbPlayback.tmdbDetail?.originalTitle,
    tmdbPlayback.tmdbDetail?.originCountry,
    tmdbPlayback.tmdbDetail?.overview,
    tmdbPlayback.tmdbDetail?.popularity,
    tmdbPlayback.tmdbDetail?.posterPath,
    tmdbPlayback.tmdbDetail?.releaseDate,
    tmdbPlayback.tmdbDetail?.title,
    tmdbPlayback.tmdbDetail?.voteAverage,
    tmdbPlayback.tmdbDetail?.voteCount,
    toggleTmdbFavorite,
  ])

  const sourceOptions = useMemo(() => {
    if (isTmdbRoute) {
      return tmdbPlayback.sourceOptions
    }

    const sourceName =
      detail?.videoInfo?.source_name || sourceConfig?.name || routeSourceCode || resolvedSourceCode || '直连源'

    return [
      {
        sourceCode: resolvedSourceCode,
        sourceName,
        bestVodId: resolvedVodId,
        bestScore: 0,
      },
    ]
  }, [
    detail?.videoInfo?.source_name,
    isTmdbRoute,
    resolvedSourceCode,
    resolvedVodId,
    routeSourceCode,
    sourceConfig?.name,
    tmdbPlayback.sourceOptions,
  ])

  const title = detail?.videoInfo?.title || tmdbPlayback.tmdbDetail?.title || '未知视频'
  const sourceName =
    detail?.videoInfo?.source_name ||
    sourceOptions.find(option => option.sourceCode === resolvedSourceCode)?.sourceName ||
    '未知来源'

  const rawOverview = tmdbPlayback.tmdbDetail?.overview || detail?.videoInfo?.desc || ''
  const overview = isCmsRoute ? stripHtmlTags(rawOverview) : rawOverview
  const pageTitle = title || '视频播放'
  useDocumentTitle(pageTitle)

  const recommendationItems = isTmdbRoute
    ? tmdbPlayback.recommendations.length > 0
      ? tmdbPlayback.recommendations
      : fallbackRecommendations
    : []
  const detailLink =
    isTmdbRoute && tmdbMediaType ? buildTmdbDetailPath(tmdbMediaType, tmdbId) : undefined
  const seasonCount =
    tmdbMediaType === 'tv'
      ? tmdbPlayback.tmdbRichDetail?.number_of_seasons || tmdbPlayback.seasonOptions.length
      : undefined
  const episodeCount =
    tmdbMediaType === 'tv'
      ? tmdbPlayback.tmdbRichDetail?.number_of_episodes || detail?.episodes.length
      : undefined
  const hasSeasonPanel = !isCmsRoute && tmdbPlayback.seasonOptions.length > 0

  const modeLabel = isTmdbRoute ? 'TMDB 播放模式' : 'CMS 直连模式'
  const collapsibleContentClassName =
    'overflow-hidden border-t border-border/45 p-3 md:p-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:slide-in-from-top-1 data-[state=closed]:slide-out-to-top-1 data-[state=open]:duration-300 data-[state=closed]:duration-200'

  const getPanelClassName = (panel: 'source' | 'season' | 'episode') =>
    cn(
      'overflow-hidden rounded-lg border border-border/60 bg-card/55 transition-all',
      activeRightPanel === panel && 'xl:flex xl:min-h-0 xl:flex-1 xl:flex-col',
    )

  useEffect(() => {
    if (isCmsRoute && activeRightPanel !== 'episode') {
      setActiveRightPanel('episode')
      return
    }

    if (!hasSeasonPanel && activeRightPanel === 'season') {
      setActiveRightPanel('episode')
    }
  }, [activeRightPanel, hasSeasonPanel, isCmsRoute])

  const shouldShowLoading =
    !detail &&
    (loading ||
      (isTmdbRoute && (tmdbPlayback.tmdbLoading || (!tmdbPlayback.playlist.searched && !tmdbPlayback.tmdbError))))

  if (shouldShowLoading) {
    return <PlayerLoadingSkeleton mode={isCmsRoute ? 'cms' : 'tmdb'} />
  }

  if (tmdbPlayback.tmdbError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="space-y-4 pt-6 text-center">
            <p className="text-sm text-red-500">{tmdbPlayback.tmdbError}</p>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              返回
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!detail || detail.episodes.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="space-y-4 pt-6 text-center">
            <p className="text-sm text-red-500">{error || '无法获取播放信息'}</p>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              返回
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-5">
      {isTmdbRoute && (
        <PlayerHeroSection
          modeLabel={modeLabel}
          sourceName={sourceName}
          title={title}
          overview={overview}
          posterPath={tmdbPlayback.tmdbDetail?.posterPath}
          backdropPath={tmdbPlayback.tmdbDetail?.backdropPath}
          tmdbMediaType={tmdbMediaType}
          currentEpisodeText={episodes[selectedEpisode] || `第 ${selectedEpisode + 1} 集`}
          totalEpisodeText={`${detail.episodes.length} 集`}
          onBack={() => navigate(-1)}
        />
      )}

      <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-3">
          {error && (
            <div className="rounded-lg border border-red-400/35 bg-red-500/10 px-3 py-2 text-sm text-red-500">
              {error}
            </div>
          )}

          <section className="relative overflow-hidden rounded-lg border border-border/60 bg-black/95 shadow-lg">
            <div
              id="player"
              ref={containerRef}
              className="aspect-video min-h-[180px] w-full bg-black sm:h-[clamp(240px,56vw,74vh)] sm:min-h-[220px] sm:aspect-auto [&_.art-video-player]:!h-full [&_.art-video-player]:!w-full [&_.artplayer-app]:!h-full [&_.artplayer-app]:!w-full [&_video]:!h-full [&_video]:!w-full"
            />
            {playerNotice && (
              <div className="pointer-events-none absolute top-3 right-3 z-30 w-[min(78vw,340px)]">
                <div className="overflow-hidden rounded-md border border-white/15 bg-black/65 shadow-lg backdrop-blur-sm">
                  <div className="px-3 py-1.5 text-xs text-white">{playerNotice}</div>
                  <div className="h-0.5 bg-white/20">
                    <div
                      className="h-full bg-red-500 transition-[width] ease-linear"
                      style={{
                        width: `${playerNoticeProgress}%`,
                        transitionDuration: `${playerNoticeDuration}ms`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            {isDetailRefreshing && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                <div className="flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-sm text-white">
                  <Spinner size="sm" />
                  正在切换资源...
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="xl:sticky xl:top-20 xl:h-[clamp(240px,56vw,74vh)] xl:min-h-[220px] xl:pr-1">
          {isCmsRoute ? (
            <section className="space-y-3 rounded-lg border border-border/60 bg-card/55 p-3 md:p-4 xl:h-full xl:min-h-0">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">选集</h2>
                <span className="text-muted-foreground text-xs">共 {detail.episodes.length} 集</span>
              </div>
              <PlayerEpisodePanel
                totalEpisodes={detail.episodes.length}
                selectedEpisode={selectedEpisode}
                isReversed={episodePagination.isReversed}
                onToggleOrder={() => episodePagination.setIsReversed(prev => !prev)}
                pageRanges={episodePagination.pageRanges}
                currentPageRange={episodePagination.currentPageRange}
                onPageRangeChange={episodePagination.setCurrentPageRange}
                episodes={episodePagination.currentPageEpisodes}
                onEpisodeSelect={handleEpisodeChange}
                episodeProgressMap={episodeProgressMap}
                compact
                fillHeight
                hideHeader
                className="border-0 bg-transparent p-0 md:p-0"
              />
            </section>
          ) : (
            <div className="space-y-3 xl:flex xl:h-full xl:flex-col xl:gap-3 xl:space-y-0">
              <Collapsible
                open={activeRightPanel === 'source'}
                onOpenChange={open => setActiveRightPanel(open ? 'source' : null)}
                className={getPanelClassName('source')}
              >
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-3 text-sm font-semibold md:px-4"
                  >
                    <span className="flex items-center gap-1.5">
                      换源
                      <span className="text-muted-foreground text-xs">{sourceOptions.length} 源</span>
                    </span>
                    <ChevronDown
                      className={`size-4 transition-transform ${activeRightPanel === 'source' ? 'rotate-180' : ''}`}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent
                  className={cn(
                    collapsibleContentClassName,
                    activeRightPanel === 'source' && 'xl:flex-1 xl:min-h-0',
                  )}
                >
                  <div className="flex flex-wrap gap-2">
                    {sourceOptions.map(option => {
                      const active = option.sourceCode === resolvedSourceCode
                      return (
                        <Button
                          key={option.sourceCode}
                          size="sm"
                          variant={active ? 'default' : 'secondary'}
                          className="rounded-full"
                          onClick={() => handleSourceChange(option.sourceCode)}
                        >
                          {option.sourceName}
                          {isTmdbRoute && <span className="text-[11px] opacity-70">{option.bestScore}</span>}
                        </Button>
                      )
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>

            {hasSeasonPanel && (
              <Collapsible
                open={activeRightPanel === 'season'}
                onOpenChange={open => setActiveRightPanel(open ? 'season' : null)}
                className={getPanelClassName('season')}
              >
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-3 text-sm font-semibold md:px-4"
                  >
                    <span className="flex items-center gap-1.5">
                      选季
                      <span className="text-muted-foreground text-xs">
                        {tmdbPlayback.seasonOptions.length} 季
                      </span>
                    </span>
                    <ChevronDown
                      className={`size-4 transition-transform ${activeRightPanel === 'season' ? 'rotate-180' : ''}`}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent
                  className={cn(
                    collapsibleContentClassName,
                    activeRightPanel === 'season' && 'xl:flex-1 xl:min-h-0',
                  )}
                >
                  <div className="flex flex-wrap gap-2">
                    {tmdbPlayback.seasonOptions.map(option => {
                      const active = option.seasonNumber === tmdbPlayback.selectedSeasonNumber
                      return (
                        <Button
                          key={option.seasonNumber}
                          size="sm"
                          variant={active ? 'default' : 'secondary'}
                          className="rounded-full"
                          onClick={() => handleSeasonChange(option.seasonNumber)}
                        >
                          S{option.seasonNumber}
                          <span className="text-[11px] opacity-70">{option.matchedSourceCount}</span>
                        </Button>
                      )
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
            {episodes.length > 0 && (
                <Collapsible
                  open={activeRightPanel === 'episode'}
                  onOpenChange={open => setActiveRightPanel(open ? 'episode' : null)}
                  className={getPanelClassName('episode')}
                >
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-3 py-3 text-sm font-semibold md:px-4"
                    >
                      <span className="flex items-center gap-1.5">
                        选集
                        <span className="text-muted-foreground text-xs">
                          第 {selectedEpisode + 1} 集 / 共 {detail.episodes.length} 集
                        </span>
                      </span>
                      <ChevronDown
                        className={`size-4 transition-transform ${activeRightPanel === 'episode' ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent
                    className={cn(
                      collapsibleContentClassName,
                      activeRightPanel === 'episode' && 'xl:flex-1 xl:min-h-0',
                    )}
                  >
                    <div className={activeRightPanel === 'episode' ? 'xl:h-full' : undefined}>
                      <PlayerEpisodePanel
                        totalEpisodes={detail.episodes.length}
                        selectedEpisode={selectedEpisode}
                        isReversed={episodePagination.isReversed}
                        onToggleOrder={() => episodePagination.setIsReversed(prev => !prev)}
                        pageRanges={episodePagination.pageRanges}
                        currentPageRange={episodePagination.currentPageRange}
                        onPageRangeChange={episodePagination.setCurrentPageRange}
                        episodes={episodePagination.currentPageEpisodes}
                        onEpisodeSelect={handleEpisodeChange}
                        episodeProgressMap={episodeProgressMap}
                        compact
                        fillHeight={activeRightPanel === 'episode'}
                        hideHeader
                        className="border-0 bg-transparent p-0 md:p-0"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
            )}
            </div>
          )}
        </aside>
      </section>

      <PlayerInfoAndRecommendations
        title={title}
        originalTitle={tmdbPlayback.tmdbDetail?.originalTitle}
        overview={overview}
        sourceName={sourceName}
        modeLabel={modeLabel}
        releaseDate={tmdbPlayback.tmdbDetail?.releaseDate}
        rating={tmdbPlayback.tmdbDetail?.voteAverage}
        posterPath={tmdbPlayback.tmdbDetail?.posterPath}
        cmsCover={detail.videoInfo?.cover}
        tmdbMediaType={tmdbMediaType}
        seasonCount={seasonCount}
        episodeCount={episodeCount}
        detailLink={detailLink}
        showRecommendations={isTmdbRoute}
        favoriteAction={
          isCmsRoute
            ? {
                active: cmsFavoriteActive,
                onToggle: handleToggleCmsFavorite,
              }
            : isTmdbRoute && tmdbMediaType
              ? {
                  active: tmdbFavoriteActive,
                  onToggle: handleToggleTmdbFavorite,
                }
              : undefined
        }
        recommendations={recommendationItems}
      />
    </div>
  )
}
