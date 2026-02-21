import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  SearchProgressEvent,
  SearchResultEvent,
  SearchStartEvent,
  VideoItem,
  VideoSource,
} from '@ouonnki/cms-core'
import type { TmdbMediaType } from '@/shared/types/tmdb'
import { useCmsClient } from '@/shared/hooks'
import { useApiStore } from '@/shared/store/apiStore'
import { useSettingStore } from '@/shared/store/settingStore'
import { useTmdbMatchCacheStore } from '@/shared/store/tmdbMatchCacheStore'
import {
  buildPlaylistMatches,
  type PlaylistMatchItem,
  type SeasonSourceMatches,
  type SourceBestMatch,
} from './playlistMatcher'
import type { DetailSeason } from './types'

interface UsePlaylistMatchesParams {
  active: boolean
  tmdbType: TmdbMediaType
  tmdbId: number
  title: string
  originalTitle?: string
  releaseDate?: string
  seasons: DetailSeason[]
}

export interface PlaylistMatchesProgress {
  phase: 'idle' | 'search' | 'match' | 'complete'
  completed: number
  total: number
  currentSourceName: string
  currentSourceId: string
  lastEvent: 'idle' | 'start' | 'progress' | 'result' | 'complete'
  lastEventAt: number | null
  lastResultSourceName: string
  lastResultSourceId: string
  lastResultCount: number
}

interface PlaylistMatchesState {
  loading: boolean
  error: string | null
  searched: boolean
  searchedKeyword: string
  progress: PlaylistMatchesProgress
  startedAt: number | null
  completedAt: number | null
  candidates: PlaylistMatchItem[]
  movieSourceMatches: SourceBestMatch[]
  seasonSourceMatches: SeasonSourceMatches[]
}

const initialState: PlaylistMatchesState = {
  loading: false,
  error: null,
  searched: false,
  searchedKeyword: '',
  progress: {
    phase: 'idle',
    completed: 0,
    total: 0,
    currentSourceName: '',
    currentSourceId: '',
    lastEvent: 'idle',
    lastEventAt: null,
    lastResultSourceName: '',
    lastResultSourceId: '',
    lastResultCount: 0,
  },
  startedAt: null,
  completedAt: null,
  candidates: [],
  movieSourceMatches: [],
  seasonSourceMatches: [],
}

const TMDB_MATCH_CACHE_MAX_ENTRIES = 200

const normalizeCacheText = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ')

const buildSourceSignature = (sources: VideoSource[]) =>
  sources
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(source => {
      const updatedAt =
        source.updatedAt instanceof Date
          ? source.updatedAt.getTime()
          : source.updatedAt
            ? new Date(source.updatedAt).getTime()
            : 0
      return [
        source.id,
        source.url || '',
        source.detailUrl || '',
        source.timeout ?? '',
        source.retry ?? '',
        Number.isFinite(updatedAt) ? updatedAt : 0,
      ].join('|')
    })
    .join(';;')

const buildSeasonSignature = (seasons: DetailSeason[]) =>
  seasons
    .slice()
    .sort((a, b) => {
      if (a.season_number !== b.season_number) return a.season_number - b.season_number
      return a.id - b.id
    })
    .map(season => `${season.id}|${season.season_number}`)
    .join(';;')

export function usePlaylistMatches({
  active,
  tmdbType,
  tmdbId,
  title,
  originalTitle,
  releaseDate,
  seasons,
}: UsePlaylistMatchesParams) {
  const cmsClient = useCmsClient()
  const videoAPIs = useApiStore(state => state.videoAPIs)
  const tmdbMatchCacheTTLHours = useSettingStore(state => state.playback.tmdbMatchCacheTTLHours)
  const getTmdbMatchCacheEntry = useTmdbMatchCacheStore(state => state.getEntry)
  const setTmdbMatchCacheEntry = useTmdbMatchCacheStore(state => state.setEntry)
  const pruneTmdbMatchCache = useTmdbMatchCacheStore(state => state.prune)
  const enabledSources = useMemo(() => videoAPIs.filter(source => source.isEnabled), [videoAPIs])

  const [state, setState] = useState<PlaylistMatchesState>(initialState)
  const abortRef = useRef<AbortController | null>(null)
  const searchKeyRef = useRef('')
  const sessionRef = useRef<{
    token: string
    keyword: string
    sourceIdSet: Set<string>
  } | null>(null)
  const uniqueMapRef = useRef<Map<string, VideoItem>>(new Map())
  const recomputeTimerRef = useRef<number | null>(null)
  const unsubRef = useRef<Array<() => void>>([])

  const clearRecomputeTimer = useCallback(() => {
    if (!recomputeTimerRef.current) return
    window.clearTimeout(recomputeTimerRef.current)
    recomputeTimerRef.current = null
  }, [])

  const clearSubscriptions = useCallback(() => {
    unsubRef.current.forEach(unsub => unsub())
    unsubRef.current = []
  }, [])

  const scheduleRecompute = useCallback(
    (params: {
      keyword: string
      releaseYear?: string
      sourceMetaList: Array<{ id: string; name: string }>
    }) => {
      clearRecomputeTimer()

      recomputeTimerRef.current = window.setTimeout(() => {
        const items = Array.from(uniqueMapRef.current.values())
        const { candidates, movieSourceMatches, seasonSourceMatches } = buildPlaylistMatches({
          mediaType: tmdbType,
          items,
          title: params.keyword,
          originalTitle,
          releaseYear: params.releaseYear,
          seasons,
          sources: params.sourceMetaList,
        })

        setState(prev => ({
          ...prev,
          candidates,
          movieSourceMatches,
          seasonSourceMatches,
        }))
      }, 160)
    },
    [clearRecomputeTimer, originalTitle, seasons, tmdbType],
  )

  const runSearch = useCallback(
    async (force = false) => {
      const keyword = title.trim()
      const releaseYear = releaseDate ? releaseDate.slice(0, 4) : undefined
      const normalizedKeyword = normalizeCacheText(keyword)
      const normalizedOriginalTitle = normalizeCacheText(originalTitle || '')
      const sourceSignature = buildSourceSignature(enabledSources)
      const seasonSignature = tmdbType === 'tv' ? buildSeasonSignature(seasons) : 'movie'
      const currentKey = [
        tmdbType,
        tmdbId,
        normalizedKeyword,
        normalizedOriginalTitle,
        releaseYear || '',
        sourceSignature,
        seasonSignature,
      ].join('::')

      if (!keyword) {
        setState(prev => ({
          ...prev,
          loading: false,
          searched: true,
          error: '当前条目缺少标题，无法搜索播放资源',
        }))
        return
      }

      if (enabledSources.length === 0) {
        setState(prev => ({
          ...prev,
          loading: false,
          searched: true,
          searchedKeyword: keyword,
          error: '当前没有启用的 CMS 视频源，请先到设置中启用视频源',
          progress: {
            phase: 'idle',
            completed: 0,
            total: 0,
            currentSourceName: '',
            currentSourceId: '',
            lastEvent: 'idle',
            lastEventAt: null,
            lastResultSourceName: '',
            lastResultSourceId: '',
            lastResultCount: 0,
          },
          startedAt: null,
          completedAt: null,
          candidates: [],
          movieSourceMatches: [],
          seasonSourceMatches: [],
        }))
        return
      }

      if (!force && searchKeyRef.current === currentKey && state.searched) {
        return
      }

      if (!force) {
        const cachedEntry = getTmdbMatchCacheEntry(currentKey, tmdbMatchCacheTTLHours)
        if (cachedEntry) {
          abortRef.current?.abort()
          clearSubscriptions()
          clearRecomputeTimer()
          searchKeyRef.current = currentKey
          setState(prev => ({
            ...prev,
            loading: false,
            error: null,
            searched: true,
            searchedKeyword: cachedEntry.payload.searchedKeyword,
            progress: {
              phase: 'complete',
              completed: 0,
              total: 0,
              currentSourceName: '',
              currentSourceId: '',
              lastEvent: 'complete',
              lastEventAt: Date.now(),
              lastResultSourceName: '',
              lastResultSourceId: '',
              lastResultCount: 0,
            },
            startedAt: null,
            completedAt: null,
            candidates: cachedEntry.payload.candidates,
            movieSourceMatches: cachedEntry.payload.movieSourceMatches,
            seasonSourceMatches: cachedEntry.payload.seasonSourceMatches,
          }))
          return
        }
      }

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      searchKeyRef.current = currentKey

      clearSubscriptions()
      uniqueMapRef.current = new Map()

      const sourceMetaList = enabledSources.map(source => ({
        id: source.id,
        name: source.name || source.id || '未知源',
      }))
      const sessionToken = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

      sessionRef.current = {
        token: sessionToken,
        keyword,
        sourceIdSet: new Set(sourceMetaList.map(source => source.id)),
      }

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        searched: true,
        searchedKeyword: keyword,
        startedAt: Date.now(),
        completedAt: null,
        progress: {
          phase: 'search',
          completed: 0,
          total: enabledSources.length,
          currentSourceName: '',
          currentSourceId: '',
          lastEvent: 'start',
          lastEventAt: Date.now(),
          lastResultSourceName: '',
          lastResultSourceId: '',
          lastResultCount: 0,
        },
        candidates: [],
        movieSourceMatches: [],
        seasonSourceMatches: [],
      }))

      try {
        const isSameSources = (sources: VideoSource[]) => {
          const session = sessionRef.current
          if (!session) return false
          if (sources.length !== session.sourceIdSet.size) return false
          return sources.every(source => session.sourceIdSet.has(source.id))
        }

        const onStart = (event: SearchStartEvent) => {
          const session = sessionRef.current
          if (!session || session.token !== sessionToken) return
          if (event.query !== session.keyword) return
          if (!isSameSources(event.sources)) return

          setState(prev => ({
            ...prev,
            progress: {
              ...prev.progress,
              phase: 'search',
              lastEvent: 'start',
              lastEventAt: Date.now(),
            },
          }))
        }

        const onProgress = (event: SearchProgressEvent) => {
          const session = sessionRef.current
          if (!session || session.token !== sessionToken) return
          if (!session.sourceIdSet.has(event.source.id)) return

          setState(prev => ({
            ...prev,
            progress: {
              phase: 'search',
              completed: event.completed,
              total: event.total,
              currentSourceName: event.source.name || event.source.id || '未知源',
              currentSourceId: event.source.id,
              lastEvent: 'progress',
              lastEventAt: Date.now(),
              lastResultSourceName: prev.progress.lastResultSourceName,
              lastResultSourceId: prev.progress.lastResultSourceId,
              lastResultCount: prev.progress.lastResultCount,
            },
          }))
        }

        const onResult = (event: SearchResultEvent) => {
          const session = sessionRef.current
          if (!session || session.token !== sessionToken) return
          if (!session.sourceIdSet.has(event.source.id)) return

          setState(prev => ({
            ...prev,
            progress: {
              ...prev.progress,
              phase: 'match',
              lastEvent: 'result',
              lastEventAt: Date.now(),
              lastResultSourceName: event.source.name || event.source.id || '未知源',
              lastResultSourceId: event.source.id,
              lastResultCount: event.items.length,
            },
          }))

          event.items.forEach(item => {
            const key = `${item.source_code || 'unknown'}::${item.vod_id}`
            if (!uniqueMapRef.current.has(key)) {
              uniqueMapRef.current.set(key, item)
            }
          })

          scheduleRecompute({ keyword, releaseYear, sourceMetaList })
        }

        const onComplete = () => {
          const session = sessionRef.current
          if (!session || session.token !== sessionToken) return

          setState(prev => ({
            ...prev,
            progress: {
              ...prev.progress,
              phase: 'match',
              lastEvent: 'complete',
              lastEventAt: Date.now(),
            },
          }))
          scheduleRecompute({ keyword, releaseYear, sourceMetaList })
        }

        unsubRef.current = [
          cmsClient.on('search:start', onStart),
          cmsClient.on('search:progress', onProgress),
          cmsClient.on('search:result', onResult),
          cmsClient.on('search:complete', onComplete),
        ]

        await cmsClient.aggregatedSearch(keyword, enabledSources, 1, controller.signal)

        const items = Array.from(uniqueMapRef.current.values())
        const { candidates, movieSourceMatches, seasonSourceMatches } = buildPlaylistMatches({
          mediaType: tmdbType,
          items,
          title: keyword,
          originalTitle,
          releaseYear,
          seasons,
          sources: sourceMetaList,
        })

        setState(prev => ({
          ...prev,
          loading: false,
          error: null,
          progress: { ...prev.progress, phase: 'complete', lastEvent: 'complete', lastEventAt: Date.now() },
          completedAt: Date.now(),
          candidates,
          movieSourceMatches,
          seasonSourceMatches,
        }))

        setTmdbMatchCacheEntry(currentKey, {
          searchedKeyword: keyword,
          candidates,
          movieSourceMatches,
          seasonSourceMatches,
        })
        pruneTmdbMatchCache(TMDB_MATCH_CACHE_MAX_ENTRIES)
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return
        }

        setState(prev => ({
          ...prev,
          loading: false,
          error: (error as Error).message || '搜索 CMS 资源失败',
          progress: {
            phase: 'idle',
            completed: 0,
            total: 0,
            currentSourceName: '',
            currentSourceId: '',
            lastEvent: 'idle',
            lastEventAt: null,
            lastResultSourceName: '',
            lastResultSourceId: '',
            lastResultCount: 0,
          },
          startedAt: null,
          completedAt: null,
          candidates: [],
          movieSourceMatches: [],
          seasonSourceMatches: [],
        }))
      } finally {
        clearSubscriptions()
      }
    },
    [
      clearSubscriptions,
      cmsClient,
      enabledSources,
      getTmdbMatchCacheEntry,
      originalTitle,
      pruneTmdbMatchCache,
      releaseDate,
      seasons,
      scheduleRecompute,
      setTmdbMatchCacheEntry,
      state.searched,
      title,
      tmdbMatchCacheTTLHours,
      tmdbId,
      tmdbType,
      clearRecomputeTimer,
    ],
  )

  useEffect(() => {
    if (!active) return
    runSearch(false)
  }, [active, runSearch])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      clearSubscriptions()
      clearRecomputeTimer()
    }
  }, [clearRecomputeTimer, clearSubscriptions])

  return {
    ...state,
    retry: () => runSearch(true),
  }
}
