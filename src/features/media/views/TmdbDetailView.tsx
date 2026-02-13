import { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router'
import { ArrowLeft, SearchX } from 'lucide-react'
import type { VideoItem } from '@ouonnki/cms-core'
import { useCmsClient } from '@/shared/hooks'
import { useTmdbDetail } from '@/shared/hooks/useTmdb'
import { getPosterUrl } from '@/shared/lib/tmdb'
import { buildTmdbPlayPath } from '@/shared/lib/routes'
import { useApiStore } from '@/shared/store/apiStore'
import type { TmdbMediaType, TmdbMovieDetail, TmdbTvDetail } from '@/shared/types/tmdb'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Spinner } from '@/shared/components/ui/spinner'

const normalizeTitle = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]/g, '')
    .trim()

const isSupportedMediaType = (value: string): value is TmdbMediaType => value === 'movie' || value === 'tv'

const buildMatchScore = (item: VideoItem, titleCandidates: string[], releaseYear?: string) => {
  const name = normalizeTitle(item.vod_name || '')
  let score = 0

  for (const candidate of titleCandidates) {
    if (!candidate) continue
    if (name === candidate) {
      score = Math.max(score, 100)
      continue
    }

    if (name.includes(candidate) || candidate.includes(name)) {
      score = Math.max(score, 75)
      continue
    }
  }

  if (releaseYear && item.vod_year === releaseYear) {
    score += 12
  }

  if (item.vod_remarks) {
    score += 3
  }

  return score
}

/**
 * TmdbDetailView - TMDB 详情页
 * 路由: /media/:type/:tmdbId
 */
export default function TmdbDetailView() {
  const navigate = useNavigate()
  const { type = '', tmdbId = '' } = useParams<{ type: string; tmdbId: string }>()
  const cmsClient = useCmsClient()
  const { videoAPIs } = useApiStore()

  const mediaType = isSupportedMediaType(type) ? type : null
  const parsedTmdbId = Number(tmdbId)
  const isValidId = Number.isInteger(parsedTmdbId) && parsedTmdbId > 0
  const isValidRoute = Boolean(mediaType) && isValidId

  const { detail, loading, error } = useTmdbDetail<TmdbMovieDetail | TmdbTvDetail>(
    isValidRoute ? parsedTmdbId : undefined,
    (mediaType || 'movie') as TmdbMediaType,
  )

  const enabledSources = useMemo(() => {
    return videoAPIs.filter(source => source.isEnabled)
  }, [videoAPIs])

  const [matchedItems, setMatchedItems] = useState<VideoItem[]>([])
  const [matching, setMatching] = useState(false)
  const [matchError, setMatchError] = useState<string | null>(null)

  useEffect(() => {
    if (!detail || !mediaType || !isValidId) return
    if (enabledSources.length === 0) {
      setMatchedItems([])
      setMatchError('当前没有启用的视频源，无法匹配可播放资源')
      return
    }

    const abortController = new AbortController()

    const matchResources = async () => {
      setMatching(true)
      setMatchError(null)

      try {
        const queries = Array.from(
          new Set([detail.title, detail.originalTitle].map(value => value?.trim()).filter(Boolean)),
        )

        const resultMap = new Map<string, VideoItem>()

        for (const query of queries) {
          const results = await cmsClient.aggregatedSearch(
            query,
            enabledSources,
            1,
            abortController.signal,
          )

          results.forEach(item => {
            const key = `${item.source_code}::${item.vod_id}`
            if (!resultMap.has(key)) {
              resultMap.set(key, item)
            }
          })
        }

        const releaseYear = detail.releaseDate?.slice(0, 4)
        const normalizedCandidates = queries.map(normalizeTitle)

        const rankedItems = Array.from(resultMap.values())
          .map(item => ({
            item,
            score: buildMatchScore(item, normalizedCandidates, releaseYear),
          }))
          .filter(result => result.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 24)
          .map(result => result.item)

        setMatchedItems(rankedItems)
      } catch (matchErr) {
        if ((matchErr as Error).name !== 'AbortError') {
          setMatchError((matchErr as Error).message || '匹配资源失败')
        }
      } finally {
        setMatching(false)
      }
    }

    matchResources()

    return () => {
      abortController.abort()
    }
  }, [cmsClient, detail, enabledSources, isValidId, mediaType])

  if (!isValidRoute) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="space-y-4 pt-6 text-center">
            <p className="text-sm text-red-500">无效的媒体地址，请返回重试</p>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              返回
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-muted-foreground text-sm">正在加载 TMDB 详情...</p>
        </div>
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="space-y-4 pt-6 text-center">
            <p className="text-sm text-red-500">{error || '获取详情失败'}</p>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              返回
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const tmdbType = mediaType as TmdbMediaType

  return (
    <div className="space-y-5 p-4 pb-8 md:p-6">
      <div>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4" />
          返回
        </Button>
      </div>

      <Card className="overflow-hidden border-none bg-white/20 shadow-sm backdrop-blur-md">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="mx-auto w-45 shrink-0 md:mx-0">
              <div className="overflow-hidden rounded-lg">
                {detail.posterPath ? (
                  <img
                    src={getPosterUrl(detail.posterPath, 'w342')}
                    alt={detail.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="bg-muted text-muted-foreground flex aspect-[2/3] items-center justify-center text-xs">
                    无海报
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">{detail.title}</h1>
                {detail.originalTitle && detail.originalTitle !== detail.title && (
                  <p className="text-muted-foreground text-sm">{detail.originalTitle}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{mediaType === 'movie' ? '电影' : '剧集'}</Badge>
                {detail.releaseDate && <Badge variant="secondary">{detail.releaseDate}</Badge>}
                {detail.voteAverage > 0 && (
                  <Badge variant="secondary">评分 {detail.voteAverage.toFixed(1)}</Badge>
                )}
              </div>
              {detail.overview && (
                <p className="text-muted-foreground line-clamp-5 text-sm leading-6">
                  {detail.overview}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none bg-white/20 shadow-sm backdrop-blur-md">
        <CardContent className="space-y-4 p-4 md:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">可播放资源匹配</h2>
            {matching && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Spinner size="sm" />
                匹配中...
              </div>
            )}
          </div>

          {matchError && <p className="text-sm text-red-500">{matchError}</p>}

          {!matching && !matchError && matchedItems.length === 0 && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <SearchX className="size-4" />
              暂未匹配到可播放资源，可稍后重试
            </div>
          )}

          {matchedItems.length > 0 && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {matchedItems.map(item => (
                <div
                  key={`${item.source_code}-${item.vod_id}`}
                  className="rounded-lg border border-white/30 bg-white/30 p-3"
                >
                  <div className="mb-3 space-y-1">
                    <p className="line-clamp-1 font-medium">{item.vod_name}</p>
                    <p className="text-muted-foreground text-xs">
                      来源：{item.source_name} {item.vod_year ? `· ${item.vod_year}` : ''}
                    </p>
                  </div>
                  <Button asChild size="sm" className="w-full">
                    <NavLink
                      to={buildTmdbPlayPath(tmdbType, parsedTmdbId, {
                        sourceCode: item.source_code,
                        vodId: item.vod_id,
                      })}
                    >
                      使用该资源播放
                    </NavLink>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
