import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import Artplayer from 'artplayer'
import Hls, {
  type LoaderContext,
  type LoaderCallbacks,
  type LoaderResponse,
  type LoaderStats,
  type HlsConfig,
  type LoaderConfiguration,
} from 'hls.js'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DetailResponse } from '@/types'
import { apiService } from '@/services/api.service'
import { useApiStore } from '@/store/apiStore'
import { useViewingHistoryStore } from '@/store/viewingHistoryStore'
import { useSettingStore } from '@/store/settingStore'
import { useDocumentTitle } from '@/hooks'
import { ArrowUpIcon, ArrowDownIcon } from '@/components/icons'
import _ from 'lodash'
import { toast } from 'sonner'

function filterAdsFromM3U8(m3u8Content: string) {
  if (!m3u8Content) return ''

  const lines = m3u8Content.split('\n')
  const filteredLines = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line.includes('#EXT-X-DISCONTINUITY')) {
      filteredLines.push(line)
    }
  }

  return filteredLines.join('\n')
}

interface ExtendedLoaderContext extends LoaderContext {
  type: string
}

interface ArtplayerWithHls extends Artplayer {
  hls?: Hls
}

class CustomHlsJsLoader extends Hls.DefaultConfig.loader {
  constructor(config: HlsConfig) {
    super(config)
    const load = this.load.bind(this)
    this.load = function (
      context: LoaderContext,
      config: LoaderConfiguration,
      callbacks: LoaderCallbacks<LoaderContext>,
    ) {
      const ctx = context as ExtendedLoaderContext
      if (ctx.type === 'manifest' || ctx.type === 'level') {
        const onSuccess = callbacks.onSuccess
        callbacks.onSuccess = function (
          response: LoaderResponse,
          stats: LoaderStats,
          context: LoaderContext,
          networkDetails: unknown,
        ) {
          if (response.data && typeof response.data === 'string') {
            response.data = filterAdsFromM3U8(response.data)
          }
          return onSuccess(response, stats, context, networkDetails)
        }
      }
      load(context, config, callbacks)
    }
  }
}

/**
 * RawPlayer - 直连模式播放器
 * 路由: /play/raw?id=xxx&source=xxx&ep=xxx
 */
export default function RawPlayer() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const vodId = searchParams.get('id') || ''
  const sourceCode = searchParams.get('source') || ''
  const episodeIndexParam = searchParams.get('ep') || '0'

  const playerRef = useRef<Artplayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { videoAPIs, adFilteringEnabled } = useApiStore()
  const { addViewingHistory, viewingHistory } = useViewingHistoryStore()
  const { playback } = useSettingStore()

  const viewingHistoryRef = useRef(viewingHistory)
  const playbackRef = useRef(playback)

  useEffect(() => {
    viewingHistoryRef.current = viewingHistory
    playbackRef.current = playback
  }, [viewingHistory, playback])

  const [detail, setDetail] = useState<DetailResponse | null>(null)
  const [selectedEpisode, setSelectedEpisode] = useState(() => {
    const index = parseInt(episodeIndexParam)
    return isNaN(index) ? 0 : index
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isReversed, setIsReversed] = useState(playback.defaultEpisodeOrder === 'desc')
  const [currentPageRange, setCurrentPageRange] = useState<string>('')
  const [episodesPerPage, setEpisodesPerPage] = useState(100)

  useEffect(() => {
    const calculateEpisodesPerPage = () => {
      const width = window.innerWidth
      let cols = 2
      let rows = 8

      if (width >= 1024) {
        cols = 8
        rows = 5
      } else if (width >= 768) {
        cols = 6
        rows = 6
      } else if (width >= 640) {
        cols = 3
        rows = 8
      }

      setEpisodesPerPage(cols * rows)
    }

    calculateEpisodesPerPage()
    window.addEventListener('resize', calculateEpisodesPerPage)
    return () => window.removeEventListener('resize', calculateEpisodesPerPage)
  }, [])

  const getTitle = () => detail?.videoInfo?.title || '未知视频'
  const sourceName = detail?.videoInfo?.source_name || '未知来源'

  const pageTitle = useMemo(() => {
    const title = detail?.videoInfo?.title
    if (title) {
      return `${title}`
    }
    return '视频播放'
  }, [detail?.videoInfo?.title])

  useDocumentTitle(pageTitle)

  useEffect(() => {
    const fetchVideoDetail = async () => {
      if (!sourceCode || !vodId) {
        setError('缺少必要的参数')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const api = videoAPIs.find(api => api.id === sourceCode)
        if (!api) {
          throw new Error('未找到对应的API配置')
        }

        const response = await apiService.getVideoDetail(vodId, api)

        if (response.code === 200 && response.episodes && response.episodes.length > 0) {
          setDetail(response)
        } else {
          throw new Error(response.msg || '获取视频详情失败')
        }
      } catch (err) {
        console.error('获取视频详情失败:', err)
        setError(err instanceof Error ? err.message : '获取视频详情失败')
      } finally {
        setLoading(false)
      }
    }

    fetchVideoDetail()
  }, [sourceCode, vodId, videoAPIs])

  useEffect(() => {
    const urlEpisodeIndex = parseInt(episodeIndexParam)
    if (!isNaN(urlEpisodeIndex) && urlEpisodeIndex !== selectedEpisode) {
      setSelectedEpisode(urlEpisodeIndex)
    }
  }, [episodeIndexParam, selectedEpisode])

  useEffect(() => {
    if (!detail?.episodes || !detail.episodes[selectedEpisode] || !containerRef.current) return

    if (playerRef.current && playerRef.current.destroy) {
      playerRef.current.destroy(false)
    }

    const nextEpisode = () => {
      if (!playbackRef.current.isAutoPlayEnabled) return

      const total = detail.videoInfo?.episodes_names?.length || 0
      if (selectedEpisode < total - 1) {
        const nextIndex = selectedEpisode + 1
        setSelectedEpisode(nextIndex)
        navigate(`/play/raw?id=${vodId}&source=${sourceCode}&ep=${nextIndex}`, {
          replace: true,
        })
        toast.info(`即将播放下一集: ${detail.videoInfo?.episodes_names?.[nextIndex]}`)
      }
    }

    const art = new Artplayer({
      container: containerRef.current,
      url: detail.episodes[selectedEpisode],
      volume: 0.7,
      isLive: false,
      muted: false,
      autoplay: false,
      pip: true,
      autoSize: true,
      autoMini: true,
      screenshot: true,
      setting: true,
      loop: false,
      flip: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      subtitleOffset: true,
      miniProgressBar: true,
      mutex: true,
      backdrop: true,
      playsInline: true,
      airplay: true,
      theme: '#23ade5',
      lang: 'zh-cn',
      moreVideoAttr: {
        crossOrigin: 'anonymous',
      },
      customType: {
        m3u8: function (video: HTMLMediaElement, url: string, art: Artplayer) {
          const artWithHls = art as ArtplayerWithHls
          if (Hls.isSupported()) {
            if (artWithHls.hls) artWithHls.hls.destroy()
            const hlsConfig: Partial<HlsConfig> = adFilteringEnabled
              ? { loader: CustomHlsJsLoader as unknown as typeof Hls.DefaultConfig.loader }
              : {}
            const hls = new Hls(hlsConfig)
            hls.loadSource(url)
            hls.attachMedia(video)
            artWithHls.hls = hls
            art.on('destroy', () => hls.destroy())
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url
          } else {
            art.notice.show = 'Unsupported playback format: m3u8'
          }
        },
      },
    })

    playerRef.current = art

    art.on('ready', () => {
      const existingHistory = viewingHistoryRef.current.find(
        item =>
          item.sourceCode === sourceCode &&
          item.vodId === vodId &&
          item.episodeIndex === selectedEpisode,
      )
      if (existingHistory && existingHistory.playbackPosition > 0) {
        art.seek = existingHistory.playbackPosition
        toast.success('已自动跳转到上次观看位置')
      }
    })

    const normalAddHistory = () => {
      if (!sourceCode || !vodId || !detail?.videoInfo) return
      addViewingHistory({
        title: detail.videoInfo.title || '未知视频',
        imageUrl: detail.videoInfo.cover || '',
        sourceCode: sourceCode || '',
        sourceName: detail.videoInfo.source_name || '',
        vodId: vodId || '',
        episodeIndex: selectedEpisode,
        episodeName: detail.videoInfo.episodes_names?.[selectedEpisode],
        playbackPosition: art.currentTime || 0,
        duration: art.duration || 0,
        timestamp: Date.now(),
      })
    }

    art.on('video:play', normalAddHistory)
    art.on('video:pause', normalAddHistory)
    art.on('video:ended', () => {
      normalAddHistory()
      nextEpisode()
    })
    art.on('video:error', normalAddHistory)

    let lastTimeUpdate = 0
    const TIME_UPDATE_INTERVAL = 3000

    const timeUpdateHandler = () => {
      if (!sourceCode || !vodId || !detail?.videoInfo) return
      const currentTime = art.currentTime || 0
      const duration = art.duration || 0
      const timeSinceLastUpdate = Date.now() - lastTimeUpdate

      if (timeSinceLastUpdate >= TIME_UPDATE_INTERVAL && currentTime > 0 && duration > 0) {
        lastTimeUpdate = Date.now()
        addViewingHistory({
          title: detail.videoInfo.title || '未知视频',
          imageUrl: detail.videoInfo.cover || '',
          sourceCode: sourceCode || '',
          sourceName: detail.videoInfo.source_name || '',
          vodId: vodId || '',
          episodeIndex: selectedEpisode,
          episodeName: detail.videoInfo.episodes_names?.[selectedEpisode],
          playbackPosition: currentTime,
          duration: duration,
          timestamp: Date.now(),
        })
      }
    }

    art.on('video:timeupdate', _.throttle(timeUpdateHandler, TIME_UPDATE_INTERVAL))

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        normalAddHistory()
        playerRef.current.destroy(false)
        playerRef.current = null
      }
    }
  }, [selectedEpisode, detail, sourceCode, vodId, addViewingHistory, navigate, adFilteringEnabled])

  const handleEpisodeChange = (displayIndex: number) => {
    const actualIndex = isReversed
      ? (detail?.videoInfo?.episodes_names?.length || 0) - 1 - displayIndex
      : displayIndex
    setSelectedEpisode(actualIndex)
    navigate(`/play/raw?id=${vodId}&source=${sourceCode}&ep=${actualIndex}`, {
      replace: true,
    })
  }

  const pageRanges = useMemo(() => {
    const totalEpisodes = detail?.videoInfo?.episodes_names?.length || 0
    if (totalEpisodes === 0) return []

    const ranges: { label: string; value: string; start: number; end: number }[] = []

    if (isReversed) {
      for (let i = 0; i < totalEpisodes; i += episodesPerPage) {
        const start = i
        const end = Math.min(i + episodesPerPage - 1, totalEpisodes - 1)
        const labelStart = totalEpisodes - start
        const labelEnd = totalEpisodes - end
        ranges.push({
          label: `${labelStart}-${labelEnd}`,
          value: `${start}-${end}`,
          start,
          end,
        })
      }
    } else {
      for (let i = 0; i < totalEpisodes; i += episodesPerPage) {
        const start = i
        const end = Math.min(i + episodesPerPage - 1, totalEpisodes - 1)
        ranges.push({
          label: `${start + 1}-${end + 1}`,
          value: `${start}-${end}`,
          start,
          end,
        })
      }
    }

    return ranges
  }, [detail?.videoInfo?.episodes_names?.length, episodesPerPage, isReversed])

  useEffect(() => {
    if (pageRanges.length === 0 || !detail?.videoInfo?.episodes_names) return

    const totalEpisodes = detail.videoInfo.episodes_names.length
    const actualSelectedIndex = selectedEpisode
    const displayIndex = isReversed ? totalEpisodes - 1 - actualSelectedIndex : actualSelectedIndex

    const rangeContainingSelected = pageRanges.find(
      range => displayIndex >= range.start && displayIndex <= range.end,
    )

    if (rangeContainingSelected) {
      setCurrentPageRange(rangeContainingSelected.value)
    } else {
      setCurrentPageRange(pageRanges[0].value)
    }
  }, [pageRanges, selectedEpisode, isReversed, detail?.videoInfo?.episodes_names])

  const currentPageEpisodes = useMemo(() => {
    if (!currentPageRange || !detail?.videoInfo?.episodes_names) return []

    const [start, end] = currentPageRange.split('-').map(Number)
    const totalEpisodes = detail.videoInfo.episodes_names.length
    const episodes = detail.videoInfo.episodes_names

    if (isReversed) {
      const selectedEpisodes = []
      for (let i = start; i <= end; i++) {
        const actualIndex = totalEpisodes - 1 - i
        if (actualIndex >= 0 && actualIndex < totalEpisodes) {
          selectedEpisodes.push({
            name: episodes[actualIndex],
            displayIndex: i,
            actualIndex: actualIndex,
          })
        }
      }
      return selectedEpisodes
    } else {
      return episodes.slice(start, end + 1).map((name, idx) => ({
        name,
        displayIndex: start + idx,
        actualIndex: start + idx,
      }))
    }
  }, [currentPageRange, detail?.videoInfo?.episodes_names, isReversed])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-500">正在加载视频信息...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6 text-center">
            <p className="mb-4 text-red-500">{error}</p>
            <Button className="w-full" onClick={() => navigate(-1)} variant="secondary">
              返回
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!detail || !detail.episodes || detail.episodes.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6 text-center">
            <p className="mb-4 text-gray-500">无法获取播放信息</p>
            <Button className="w-full" onClick={() => navigate(-1)} variant="secondary">
              返回
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto max-w-6xl p-2 sm:p-4">
        {/* 视频信息 - 移动端 */}
        <div className="mb-4 flex flex-col gap-2 md:hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">{sourceName}</p>
              <h4 className="text-lg font-bold">{getTitle()}</h4>
            </div>
            <Button size="sm" variant="secondary" onClick={() => navigate(-1)}>
              返回
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default">第 {selectedEpisode + 1} 集</Badge>
            <p className="text-sm text-gray-600">共 {detail.episodes.length} 集</p>
          </div>
        </div>

        {/* 视频信息 - 桌面端 */}
        <div className="mb-4 hidden items-center justify-between md:flex">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-500">{sourceName}</p>
              <h4 className="text-xl font-bold">{getTitle()}</h4>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">第 {selectedEpisode + 1} 集</Badge>
              <p className="text-sm text-gray-500">共 {detail.episodes.length} 集</p>
            </div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => navigate(-1)}>
            返回
          </Button>
        </div>

        {/* 播放器 */}
        <Card className="mb-4 overflow-hidden border-none sm:mb-6">
          <CardContent className="p-0">
            <div
              id="player"
              ref={containerRef}
              className="flex aspect-video w-full items-center rounded-lg bg-black"
            />
          </CardContent>
        </Card>

        {/* 选集列表 */}
        {detail.videoInfo?.episodes_names && detail.videoInfo?.episodes_names.length > 0 && (
          <div className="mt-4 flex flex-col">
            <div className="flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">选集</h2>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsReversed(!isReversed)}
                    className="text-sm text-gray-600"
                  >
                    {isReversed ? <ArrowUpIcon size={18} /> : <ArrowDownIcon size={18} />}
                    <span className="ml-1">{isReversed ? '正序' : '倒序'}</span>
                  </Button>
                  {pageRanges.length > 1 && (
                    <Select value={currentPageRange} onValueChange={setCurrentPageRange}>
                      <SelectTrigger className="w-32 border-gray-200 bg-white/30 font-medium text-gray-800 backdrop-blur-md">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-gray-200/50 bg-white/40 backdrop-blur-2xl">
                        {pageRanges.map(range => (
                          <SelectItem key={range.value} value={range.value}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-white/30 p-4 pt-0 shadow-lg/5 backdrop-blur-md sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-8">
              {currentPageEpisodes.map(({ name, displayIndex, actualIndex }) => {
                return (
                  <Tooltip key={`${name}-${displayIndex}`} delayDuration={1000}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        className={
                          selectedEpisode === actualIndex
                            ? 'border border-gray-200 bg-gray-900 text-white drop-shadow-2xl'
                            : 'border border-gray-200 bg-white/30 text-gray-800 drop-shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-black/80 hover:text-white'
                        }
                        onClick={() => handleEpisodeChange(displayIndex)}
                      >
                        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                          {name}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{name}</TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
