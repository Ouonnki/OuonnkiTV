import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { getTmdbClient, normalizeToMediaItem } from '../lib/tmdb'
import type {
  TmdbMediaItem,
  TmdbFilterOptions,
  TmdbFilterAvailableOptions,
  TmdbPagination,
  TmdbGenre,
} from '../types/tmdb'

interface TmdbState {
  // 搜索相关
  searchQuery: string
  searchResults: TmdbMediaItem[]
  filteredResults: TmdbMediaItem[] // 筛选后的结果
  searchPagination: TmdbPagination

  // 热映/热门
  nowPlayingMovies: TmdbMediaItem[]
  popularTv: TmdbMediaItem[]
  trending: TmdbMediaItem[]

  // 筛选条件 (内部维护)
  filterOptions: TmdbFilterOptions

  // 可用的筛选选项列表
  availableFilterOptions: TmdbFilterAvailableOptions

  // 缓存数据
  movieGenres: TmdbGenre[]
  tvGenres: TmdbGenre[]

  // 加载状态
  loading: {
    search: boolean
    nowPlaying: boolean
    trending: boolean
    genres: boolean
  }
  error: string | null
}

interface TmdbActions {
  // 搜索
  search: (query: string, page?: number) => Promise<void>

  // 热映/热门
  fetchNowPlaying: () => Promise<void>
  fetchTrending: (timeWindow?: 'day' | 'week') => Promise<void>

  // 筛选
  setFilter: (options: Partial<TmdbFilterOptions>) => void
  clearFilter: () => void

  // 基础数据
  fetchGenresAndCountries: () => Promise<void>

  // 内部辅助
  _applyFilters: () => void
  _updateAvailableYears: () => void
}

const INITIAL_FILTER: TmdbFilterOptions = {
  mediaType: 'all',
  sortOrder: 'desc',
  sortBy: 'popularity',
}

export const useTmdbStore = create<TmdbState & TmdbActions>()(
  devtools(
    immer((set, get) => ({
      // State
      searchQuery: '',
      searchResults: [],
      filteredResults: [],
      searchPagination: { page: 1, totalPages: 0, totalResults: 0 },

      nowPlayingMovies: [],
      popularTv: [],
      trending: [],

      filterOptions: { ...INITIAL_FILTER },

      availableFilterOptions: {
        genres: [],
        countries: [],
        years: [],
        mediaTypes: ['movie', 'tv'],
      },

      movieGenres: [],
      tvGenres: [],

      loading: {
        search: false,
        nowPlaying: false,
        trending: false,
        genres: false,
      },
      error: null,

      // Actions
      fetchGenresAndCountries: async () => {
        const client = getTmdbClient()
        if (get().movieGenres.length > 0) return // 已缓存

        set(state => {
          state.loading.genres = true
        })
        try {
          const [movieGenres, tvGenres, countries] = await Promise.all([
            client.genres.movies({ language: 'zh-CN' }),
            client.genres.tvShows({ language: 'zh-CN' }),
            client.configuration.getCountries(),
          ])

          set(state => {
            state.movieGenres = movieGenres.genres
            state.tvGenres = tvGenres.genres
            state.availableFilterOptions.genres = [
              ...movieGenres.genres,
              ...tvGenres.genres,
            ].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) // 去重
            state.availableFilterOptions.countries = countries
            state.loading.genres = false
          })
        } catch (err: unknown) {
          console.error('Failed to fetch TMDB config:', err)
          set(state => {
            state.loading.genres = false
          })
        }
      },

      search: async (query: string, page = 1) => {
        const client = getTmdbClient()
        set(state => {
          state.searchQuery = query
          state.loading.search = true
          state.error = null
        })

        try {
          const res = await client.search.multi({
            query,
            page,
            language: 'zh-CN',
            include_adult: false,
          })

          const results: TmdbMediaItem[] = res.results
            .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
            .map(item =>
              normalizeToMediaItem(item as unknown as Record<string, unknown>, item.media_type),
            )

          set(state => {
            state.searchResults = results
            state.searchPagination = {
              page: res.page,
              totalPages: res.total_pages,
              totalResults: res.total_results,
            }
            state.loading.search = false
          })

          // 更新可用筛选值和应用筛选
          get()._updateAvailableYears()
          get()._applyFilters()
        } catch (err: unknown) {
          set(state => {
            state.error = (err as Error).message || 'Search failed'
            state.loading.search = false
          })
        }
      },

      fetchNowPlaying: async () => {
        const client = getTmdbClient()
        set(state => {
          state.loading.nowPlaying = true
        })

        try {
          // 并行获取电影热映和剧集热门
          const [moviesRes, tvRes] = await Promise.all([
            client.movies.nowPlaying({ language: 'zh-CN' }),
            client.tvShows.popular({ language: 'zh-CN' }),
          ])

          set(state => {
            state.nowPlayingMovies = moviesRes.results.map(i =>
              normalizeToMediaItem(i as unknown as Record<string, unknown>, 'movie'),
            )
            state.popularTv = tvRes.results.map(i =>
              normalizeToMediaItem(i as unknown as Record<string, unknown>, 'tv'),
            )
            state.loading.nowPlaying = false
          })
        } catch (err: unknown) {
          set(state => {
            state.error = (err as Error).message
            state.loading.nowPlaying = false
          })
        }
      },

      fetchTrending: async (timeWindow = 'day') => {
        const client = getTmdbClient()
        set(state => {
          state.loading.trending = true
        })

        try {
          const res = await client.trending.trending('all', timeWindow as 'day' | 'week', {
            language: 'zh-CN',
          })

          const results = res.results
            .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
            .map(item =>
              normalizeToMediaItem(item as unknown as Record<string, unknown>, item.media_type),
            )

          set(state => {
            state.trending = results
            state.loading.trending = false
          })
        } catch (err: unknown) {
          set(state => {
            state.loading.trending = false
            state.error = (err as Error).message
          })
        }
      },

      setFilter: options => {
        set(state => {
          state.filterOptions = { ...state.filterOptions, ...options }
        })
        get()._applyFilters()
      },

      clearFilter: () => {
        set(state => {
          state.filterOptions = { ...INITIAL_FILTER }
        })
        get()._applyFilters()
      },

      _updateAvailableYears: () => {
        set(state => {
          const years = new Set<number>()
          state.searchResults.forEach(item => {
            if (item.releaseDate) {
              const year = parseInt(item.releaseDate.substring(0, 4))
              if (!isNaN(year)) years.add(year)
            }
          })
          state.availableFilterOptions.years = Array.from(years).sort((a, b) => b - a)
        })
      },

      _applyFilters: () => {
        const { searchResults, filterOptions } = get()

        let filtered = [...searchResults]

        // 1. MediaType
        if (filterOptions.mediaType && filterOptions.mediaType !== 'all') {
          filtered = filtered.filter(item => item.mediaType === filterOptions.mediaType)
        }

        // 2. Genre (AND logic)
        if (filterOptions.genreIds && filterOptions.genreIds.length > 0) {
          filtered = filtered.filter(item =>
            filterOptions.genreIds!.every(gid => item.genreIds.includes(gid)),
          )
        }

        // 3. Score
        if (filterOptions.minVoteAverage && filterOptions.minVoteAverage > 0) {
          filtered = filtered.filter(item => item.voteAverage >= filterOptions.minVoteAverage!)
        }

        // 4. Year
        if (filterOptions.releaseYear) {
          filtered = filtered.filter(item => {
            if (!item.releaseDate) return false
            return item.releaseDate.startsWith(filterOptions.releaseYear!.toString())
          })
        }

        // 5. Country (Origin Country)
        if (filterOptions.originCountry) {
          filtered = filtered.filter(item => {
            // 电影可能没有originCountry列表，或者在其他字段，这里做尽力而为的匹配
            // 如果 originCountry 存在且非空，检查包含
            if (item.originCountry && item.originCountry.length > 0) {
              return item.originCountry.includes(filterOptions.originCountry!)
            }
            // 备选：如果 originalLanguage 匹配国家代码 (不准确，但有时有用，例如 'zh' != 'CN')
            // 暂时只过滤明确有产地信息的
            return false
          })
        }

        // 6. Sort
        if (filterOptions.sortBy) {
          filtered.sort((a, b) => {
            let valA: number | string, valB: number | string

            switch (filterOptions.sortBy) {
              case 'vote_average':
                valA = a.voteAverage
                valB = b.voteAverage
                break
              case 'release_date':
                valA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0
                valB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0
                break
              case 'popularity':
              default:
                valA = a.popularity
                valB = b.popularity
                break
            }

            if (filterOptions.sortOrder === 'asc') {
              return valA > valB ? 1 : valA < valB ? -1 : 0
            } else {
              return valA < valB ? 1 : valA > valB ? -1 : 0
            }
          })
        }

        set(state => {
          state.filteredResults = filtered
        })
      },
    })),
  ),
)
