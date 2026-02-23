import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { useDocumentTitle } from '@/shared/hooks'
import { useTmdbEnabled } from '@/shared/hooks/useTmdbMode'
import { useTmdbDetail } from '@/shared/hooks/useTmdb'
import { buildTmdbPlayPath } from '@/shared/lib/routes'
import { buildHistoryPlayPath, isTmdbHistoryItem } from '@/shared/lib/viewingHistory'
import type {
  TmdbMediaItem,
  TmdbMediaType,
  TmdbMovieDetail,
  TmdbTvDetail,
} from '@/shared/types/tmdb'
import { useFavoritesStore } from '@/features/favorites/store/favoritesStore'
import { useViewingHistoryStore } from '@/shared/store/viewingHistoryStore'
import {
  DetailCastTab,
  DetailHeroSection,
  DetailLoadingSkeleton,
  DetailOverviewTab,
  DetailPlaylistTab,
  DetailStatePanel,
  DetailProductionTab,
  DetailSeasonsTab,
  DetailTabNav,
  type DetailInfoField,
  type DetailTab,
  type TmdbRichDetail,
  extractRecommendations,
  formatCurrencyUSD,
  formatLargeNumber,
  formatRuntime,
  getReleaseYear,
  mapAdultLevel,
  mapBooleanLabel,
  mapCountryCodeToName,
  mapLanguageCodeToName,
  mapTvTypeLabel,
  pickHeroLogo,
  usePlaylistMatches,
} from '@/features/media/components'

const isSupportedMediaType = (value: string): value is TmdbMediaType => value === 'movie' || value === 'tv'
const TMDB_SEARCH_PATH = '/search?mode=tmdb'

export default function TmdbDetailView() {
  const navigate = useNavigate()
  const tmdbEnabled = useTmdbEnabled()
  const { type = '', tmdbId = '' } = useParams<{ type: string; tmdbId: string }>()

  // TMDB 未启用时重定向到首页
  useEffect(() => {
    if (!tmdbEnabled) {
      navigate('/', { replace: true })
    }
  }, [tmdbEnabled, navigate])

  const mediaType = isSupportedMediaType(type) ? type : null
  const parsedTmdbId = Number(tmdbId)
  const isValidId = Number.isInteger(parsedTmdbId) && parsedTmdbId > 0
  const isValidRoute = Boolean(mediaType) && isValidId

  const favorited = useFavoritesStore(state =>
    mediaType && isValidId ? state.isTmdbFavorited(parsedTmdbId, mediaType) : false,
  )
  const toggleTmdbFavorite = useFavoritesStore(state => state.toggleTmdbFavorite)
  const viewingHistory = useViewingHistoryStore(state => state.viewingHistory)

  const { detail, loading, error } = useTmdbDetail<TmdbMovieDetail | TmdbTvDetail>(
    isValidRoute ? parsedTmdbId : undefined,
    (mediaType || 'movie') as TmdbMediaType,
  )
  const tmdbType = (mediaType || 'movie') as TmdbMediaType

  const [activeTab, setActiveTab] = useState<DetailTab>('overview')
  const tabListRef = useRef<HTMLDivElement | null>(null)
  const [tabIndicator, setTabIndicator] = useState({ x: 0, width: 0, ready: false })

  const tabItems: Array<{ key: DetailTab; label: string }> = [
    { key: 'overview', label: '概览' },
    { key: 'playlist', label: '播放列表' },
    { key: 'production', label: '制作与发行' },
    { key: 'cast', label: '演员' },
    ...(mediaType === 'tv' ? [{ key: 'seasons' as const, label: '季信息' }] : []),
  ]

  const updateTabIndicator = useCallback(() => {
    const listEl = tabListRef.current
    if (!listEl) return

    const activeEl = listEl.querySelector<HTMLButtonElement>(`button[data-tab='${activeTab}']`)
    if (!activeEl) {
      setTabIndicator(prev => (prev.ready ? { ...prev, ready: false } : prev))
      return
    }

    const listRect = listEl.getBoundingClientRect()
    const activeRect = activeEl.getBoundingClientRect()

    setTabIndicator({
      x: activeRect.left - listRect.left,
      width: activeRect.width,
      ready: true,
    })
  }, [activeTab])

  useDocumentTitle(detail?.title || '媒体详情')

  useLayoutEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      updateTabIndicator()
    })
    return () => window.cancelAnimationFrame(frameId)
  }, [updateTabIndicator, tabItems.length, loading, detail?.id])

  useEffect(() => {
    const onResize = () => updateTabIndicator()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [updateTabIndicator, tabItems.length])

  useEffect(() => {
    if (mediaType !== 'tv' && activeTab === 'seasons') {
      setActiveTab('overview')
    }
  }, [activeTab, mediaType])

  const safeRichDetail = detail as TmdbRichDetail | undefined
  const safeSeasons = safeRichDetail?.seasons || []
  const playlistMatches = usePlaylistMatches({
    active: activeTab === 'playlist' && Boolean(detail) && isValidRoute,
    tmdbType,
    tmdbId: parsedTmdbId,
    title: detail?.title || '',
    originalTitle: detail?.originalTitle || '',
    releaseDate: detail?.releaseDate || '',
    seasons: safeSeasons,
  })

  const latestTmdbHistory = useMemo(() => {
    if (!mediaType || !isValidRoute) return null

    const matchedItems = viewingHistory
      .filter(
      item =>
        isTmdbHistoryItem(item) &&
        item.tmdbMediaType === mediaType &&
        item.tmdbId === parsedTmdbId,
      )
      .sort((a, b) => b.timestamp - a.timestamp)
    if (matchedItems.length === 0) return null

    // 继续观看路径优先级：
    // 1. 优先选择带有 sourceCode + vodId 的记录（可直接回到上次源）
    // 2. 其次使用最近一条 tmdb 记录（回到同集/同季）
    return matchedItems.find(item => Boolean(item.sourceCode && item.vodId)) || matchedItems[0]
  }, [isValidRoute, mediaType, parsedTmdbId, viewingHistory])

  if (!isValidRoute) {
    return (
      <div className="px-4 md:px-6">
        <DetailStatePanel
          mode="error"
          tag="路由校验失败"
          title="这个详情页地址不可用"
          description="当前链接缺少有效媒体类型或 ID，无法加载影视详情。"
          primaryAction={{
            label: '返回搜索页',
            onClick: () => navigate(TMDB_SEARCH_PATH),
          }}
          secondaryAction={{
            label: '回到上一页',
            onClick: () => navigate(-1),
          }}
        />
      </div>
    )
  }

  if (loading) {
    return <DetailLoadingSkeleton />
  }

  if (error || !detail) {
    return (
      <div className="px-4 md:px-6">
        <DetailStatePanel
          mode="error"
          tag="详情加载失败"
          title="找不到影视详情"
          description={error || '该条目可能已下线，或当前服务暂不可用。'}
          primaryAction={{
            label: '返回搜索页',
            onClick: () => navigate(TMDB_SEARCH_PATH),
          }}
          secondaryAction={{
            label: '回到上一页',
            onClick: () => navigate(-1),
          }}
        />
      </div>
    )
  }

  const richDetail = detail as TmdbRichDetail

  const releaseYear = getReleaseYear(detail.releaseDate)
  const heroLogo = pickHeroLogo(richDetail.images?.logos || [])
  const adultLevel = mapAdultLevel(richDetail.adult)
  const runtimeLabel =
    tmdbType === 'movie'
      ? formatRuntime(richDetail.runtime || 0)
      : (richDetail.episode_run_time?.[0] || 0) > 0
        ? `单集约${richDetail.episode_run_time?.[0] || 0}分钟`
        : ''

  const castList = (richDetail.credits?.cast || [])
    .slice()
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .slice(0, 30)

  const genres = richDetail.genres || []
  const keywordList = richDetail.keywords?.keywords || richDetail.keywords?.results || []
  const recommendationItems = extractRecommendations(richDetail, tmdbType)

  const productionCompanies = richDetail.production_companies || []
  const productionCountries = richDetail.production_countries || []
  const spokenLanguages = richDetail.spoken_languages || []
  const networks = richDetail.networks || []
  const seasons = richDetail.seasons || []

  const mappedOriginalLanguage = mapLanguageCodeToName(detail.originalLanguage, spokenLanguages)
  const mappedOriginCountries =
    (detail.originCountry || [])
      .map(countryCode => mapCountryCodeToName(countryCode))
      .filter(Boolean)
      .join(' / ') || productionCountries.map(country => country.name).join(' / ')

  const mediaSnapshot: TmdbMediaItem = {
    id: detail.id,
    mediaType: tmdbType,
    title: detail.title,
    originalTitle: detail.originalTitle,
    overview: detail.overview,
    posterPath: detail.posterPath,
    backdropPath: detail.backdropPath,
    logoPath: null,
    releaseDate: detail.releaseDate,
    voteAverage: detail.voteAverage,
    voteCount: detail.voteCount,
    popularity: detail.popularity,
    genreIds: detail.genreIds,
    originalLanguage: detail.originalLanguage,
    originCountry: detail.originCountry,
  }

  const coreInfoFields: DetailInfoField[] = [
    { label: '发布日期', value: detail.releaseDate || '' },
    { label: '首播日期', value: richDetail.first_air_date || '' },
    { label: '最后播出', value: richDetail.last_air_date || '' },
    { label: '评分人数', value: formatLargeNumber(detail.voteCount) },
    { label: '热度', value: detail.popularity.toFixed(1) },
    { label: '原始语言', value: mappedOriginalLanguage },
    { label: '原产国家', value: mappedOriginCountries },
    { label: '剧集形式', value: tmdbType === 'tv' ? mapTvTypeLabel(richDetail.type) : '' },
    { label: '成人内容', value: adultLevel },
  ].filter(field => field.value)

  const movieInfoFields: DetailInfoField[] = [
    { label: '片长', value: runtimeLabel },
    { label: '预算', value: formatCurrencyUSD(richDetail.budget) },
    { label: '票房', value: formatCurrencyUSD(richDetail.revenue) },
    { label: '系列归属', value: richDetail.belongs_to_collection?.name || '' },
  ].filter(field => field.value)

  const tvInfoFields: DetailInfoField[] = [
    { label: '单集时长', value: runtimeLabel },
    { label: '季数', value: richDetail.number_of_seasons ? `${richDetail.number_of_seasons}` : '' },
    { label: '集数', value: richDetail.number_of_episodes ? `${richDetail.number_of_episodes}` : '' },
    { label: '制作中', value: mapBooleanLabel(richDetail.in_production) },
    {
      label: '最近播出集',
      value: richDetail.last_episode_to_air
        ? `S${richDetail.last_episode_to_air.season_number || '?'}E${richDetail.last_episode_to_air.episode_number || '?'} ${richDetail.last_episode_to_air.name || ''}`
        : '',
    },
    {
      label: '下一待播集',
      value: richDetail.next_episode_to_air
        ? `S${richDetail.next_episode_to_air.season_number || '?'}E${richDetail.next_episode_to_air.episode_number || '?'} ${richDetail.next_episode_to_air.name || ''}`
        : '',
    },
  ].filter(field => field.value)

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
      : buildTmdbPlayPath(tmdbType, detail.id, {
          episodeIndex: latestTmdbHistory.episodeIndex,
          seasonNumber:
            tmdbType === 'tv' ? latestTmdbHistory.tmdbSeasonNumber ?? undefined : undefined,
        })
    : ''

  return (
    <div className="space-y-0">
      <DetailHeroSection
        detail={detail}
        richDetail={richDetail}
        tmdbType={tmdbType}
        releaseYear={releaseYear}
        runtimeLabel={runtimeLabel}
        adultLevel={adultLevel}
        heroLogo={heroLogo}
        favorited={favorited}
        onBack={() => navigate(TMDB_SEARCH_PATH)}
        onPlayNow={() => navigate(buildTmdbPlayPath(tmdbType, detail.id))}
        onContinueWatching={
          continueWatchingPath ? () => navigate(continueWatchingPath) : undefined
        }
        continueWatchingLabel={continueWatchingLabel}
        continueWatchingProgressLabel={continueWatchingProgressLabel}
        onToggleFavorite={() => toggleTmdbFavorite(mediaSnapshot)}
      />

      <DetailTabNav
        tabListRef={tabListRef}
        tabItems={tabItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabIndicator={tabIndicator}
      />

      <div className="mt-6 px-2 pb-6 md:px-3 md:pb-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            className="space-y-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {activeTab === 'overview' && (
              <DetailOverviewTab
                tmdbType={tmdbType}
                genres={genres}
                keywordList={keywordList}
                coreInfoFields={coreInfoFields}
                movieInfoFields={movieInfoFields}
                tvInfoFields={tvInfoFields}
                recommendationItems={recommendationItems}
              />
            )}

            {activeTab === 'playlist' && (
              <DetailPlaylistTab
                tmdbType={tmdbType}
                tmdbId={detail.id}
                loading={playlistMatches.loading}
                error={playlistMatches.error}
                searched={playlistMatches.searched}
                searchedKeyword={playlistMatches.searchedKeyword}
                progress={playlistMatches.progress}
                startedAt={playlistMatches.startedAt}
                completedAt={playlistMatches.completedAt}
                candidates={playlistMatches.candidates}
                movieSourceMatches={playlistMatches.movieSourceMatches}
                seasonSourceMatches={playlistMatches.seasonSourceMatches}
                onRetry={playlistMatches.retry}
              />
            )}

            {activeTab === 'production' && (
              <DetailProductionTab
                tmdbType={tmdbType}
                movieInfoFields={movieInfoFields}
                tvInfoFields={tvInfoFields}
                productionCompanies={productionCompanies}
                productionCountries={productionCountries}
                networks={networks}
              />
            )}

            {activeTab === 'cast' && <DetailCastTab castList={castList} />}

            {activeTab === 'seasons' && <DetailSeasonsTab tmdbType={tmdbType} seasons={seasons} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
