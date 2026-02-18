import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { getTmdbClient, normalizeToMediaItem } from '../lib/tmdb'
import { useSettingStore } from './settingStore'
import type {
  TmdbMediaItem,
  TmdbFilterOptions,
  TmdbFilterAvailableOptions,
  TmdbPagination,
  TmdbGenre,
} from '../types/tmdb'

// tmdb-ts 的 language 参数要求特定字面量联合类型，这里用类型断言兼容动态值
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTmdbLanguage(): any {
  return useSettingStore.getState().system.tmdbLanguage
}

interface TmdbState {
  // 搜索相关
  searchQuery: string
  searchResults: TmdbMediaItem[]
  filteredResults: TmdbMediaItem[] // 筛选后的结果
  searchPagination: TmdbPagination

  // 发现/浏览模式（无搜索词时使用）
  discoverResults: TmdbMediaItem[]
  discoverPagination: TmdbPagination

  // 热映/热门
  nowPlayingMovies: TmdbMediaItem[]
  popularMovies: TmdbMediaItem[]
  topRatedMovies: TmdbMediaItem[]
  upcomingMovies: TmdbMediaItem[]
  popularTv: TmdbMediaItem[]
  topRatedTv: TmdbMediaItem[]
  airingTodayTv: TmdbMediaItem[]
  trending: TmdbMediaItem[]

  // 推荐
  recommendations: TmdbMediaItem[]
  recommendationSourceId: number | null // 推荐来源的 TMDB ID
  recommendationSourceMediaType: 'movie' | 'tv' | null // 推荐来源的 TMDB 媒体类型

  // 筛选条件 (内部维护)
  filterOptions: TmdbFilterOptions

  // 可用的筛选选项列表
  availableFilterOptions: TmdbFilterAvailableOptions

  // 缓存数据
  movieGenres: TmdbGenre[]
  tvGenres: TmdbGenre[]
  genresLanguage: string | null // 缓存 genres 时使用的语言

  // 加载状态
  loading: {
    search: boolean
    discover: boolean
    nowPlaying: boolean
    popularMovies: boolean
    topRatedMovies: boolean
    upcomingMovies: boolean
    popularTv: boolean
    topRatedTv: boolean
    airingTodayTv: boolean
    trending: boolean
    recommendations: boolean
    genres: boolean
  }
  error: string | null
}

interface TmdbActions {
  // 搜索
  search: (query: string, page?: number) => Promise<void>

  // 发现/浏览（无搜索词时使用 Discover API）
  fetchDiscover: (page?: number) => Promise<void>

  // 热映/热门
  fetchNowPlaying: () => Promise<void>
  fetchPopularMovies: () => Promise<void>
  fetchTopRatedMovies: () => Promise<void>
  fetchUpcomingMovies: () => Promise<void>
  fetchPopularTv: () => Promise<void>
  fetchTopRatedTv: () => Promise<void>
  fetchAiringTodayTv: () => Promise<void>
  fetchTrending: (timeWindow?: 'day' | 'week') => Promise<void>
  fetchRecommendations: (id: number, mediaType: 'movie' | 'tv') => Promise<void>

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
  // sortBy 默认为 undefined，表示按 TMDB 返回顺序不做排序
}

// 仅允许最新一次 TMDB 搜索写回结果，避免竞态导致旧结果覆盖新结果
let latestSearchRequestId = 0

export const useTmdbStore = create<TmdbState & TmdbActions>()(
  devtools(
    immer((set, get) => ({
      // State
      searchQuery: '',
      searchResults: [],
      filteredResults: [],
      searchPagination: { page: 1, totalPages: 0, totalResults: 0 },

      discoverResults: [],
      discoverPagination: { page: 1, totalPages: 0, totalResults: 0 },

      nowPlayingMovies: [],
      popularMovies: [],
      topRatedMovies: [],
      upcomingMovies: [],
      popularTv: [],
      topRatedTv: [],
      airingTodayTv: [],
      trending: [],

      recommendations: [],
      recommendationSourceId: null,
      recommendationSourceMediaType: null,

      filterOptions: { ...INITIAL_FILTER },

      availableFilterOptions: {
        genres: [],
        countries: [],
        years: [],
        mediaTypes: ['movie', 'tv'],
      },

      movieGenres: [],
      tvGenres: [],
      genresLanguage: null,

      loading: {
        search: false,
        discover: false,
        nowPlaying: false,
        popularMovies: false,
        topRatedMovies: false,
        upcomingMovies: false,
        popularTv: false,
        topRatedTv: false,
        airingTodayTv: false,
        trending: false,
        recommendations: false,
        genres: false,
      },
      error: null,

      // Actions
      fetchGenresAndCountries: async () => {
        const client = getTmdbClient()
        const currentLang = getTmdbLanguage()
        // 仅在语言未变且已缓存时跳过
        if (get().movieGenres.length > 0 && get().genresLanguage === currentLang) return

        set(state => {
          state.loading.genres = true
        })
        try {
          const [movieGenres, tvGenres, countries] = await Promise.all([
            client.genres.movies({ language: getTmdbLanguage() }),
            client.genres.tvShows({ language: getTmdbLanguage() }),
            client.configuration.getCountries(),
          ])

          set(state => {
            state.movieGenres = movieGenres.genres
            state.tvGenres = tvGenres.genres
            state.genresLanguage = currentLang
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
        const requestId = ++latestSearchRequestId
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
            language: getTmdbLanguage(),
            include_adult: false,
          })

          const results: TmdbMediaItem[] = res.results
            .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
            .map(item =>
              normalizeToMediaItem(item as unknown as Record<string, unknown>, item.media_type),
            )

          if (requestId !== latestSearchRequestId) {
            return
          }

          set(state => {
            state.searchResults = page > 1 ? [...state.searchResults, ...results] : results
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
          if (requestId !== latestSearchRequestId) {
            return
          }

          set(state => {
            state.error = (err as Error).message || 'Search failed'
            state.loading.search = false
          })
        }
      },

      fetchDiscover: async (page = 1) => {
        const client = getTmdbClient()
        const { filterOptions } = get()

        set(state => {
          state.loading.discover = true
          state.error = null
        })

        try {
          // 根据 mediaType 决定调用哪个 discover 接口
          const mediaType = filterOptions.mediaType === 'tv' ? 'tv' : 'movie'

          // 构建 discover 请求参数
          const sortByMap: Record<string, string> = {
            popularity: 'popularity.desc',
            vote_average: 'vote_average.desc',
            release_date: mediaType === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc',
          }
          const sortOrder = filterOptions.sortOrder === 'asc' ? 'asc' : 'desc'
          const sortByValue = filterOptions.sortBy
            ? sortByMap[filterOptions.sortBy]?.replace('.desc', `.${sortOrder}`) || 'popularity.desc'
            : 'popularity.desc'

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const discoverParams: any = {
            page,
            language: getTmdbLanguage(),
            sort_by: sortByValue,
          }

          // 添加分类筛选
          if (filterOptions.genreIds && filterOptions.genreIds.length > 0) {
            discoverParams.with_genres = filterOptions.genreIds.join(',')
          }

          // 添加国家筛选
          if (filterOptions.originCountry) {
            discoverParams.with_origin_country = filterOptions.originCountry
          }

          // 添加年份筛选
          if (filterOptions.releaseYear) {
            if (mediaType === 'movie') {
              discoverParams.primary_release_year = filterOptions.releaseYear
            } else {
              discoverParams.first_air_date_year = filterOptions.releaseYear
            }
          }

          // 添加评分筛选
          if (filterOptions.minVoteAverage && filterOptions.minVoteAverage > 0) {
            discoverParams['vote_average.gte'] = filterOptions.minVoteAverage
            discoverParams['vote_count.gte'] = 50 // 确保有足够的投票数
          }

          let allResults: TmdbMediaItem[] = []
          let totalPages = 0
          let totalResults = 0

          // 如果是 'all' 类型，同时获取电影和剧集
          if (filterOptions.mediaType === 'all' || !filterOptions.mediaType) {
            const [movieRes, tvRes] = await Promise.all([
              client.discover.movie(discoverParams),
              client.discover.tvShow({
                ...discoverParams,
                // TV 的年份参数不同
                first_air_date_year: filterOptions.releaseYear,
                primary_release_year: undefined,
              }),
            ])

            const movieResults = movieRes.results.map((i: unknown) =>
              normalizeToMediaItem(i as Record<string, unknown>, 'movie'),
            )
            const tvResults = tvRes.results.map((i: unknown) =>
              normalizeToMediaItem(i as Record<string, unknown>, 'tv'),
            )

            // 合并并按热度排序
            allResults = [...movieResults, ...tvResults].sort((a, b) => b.popularity - a.popularity)
            totalPages = Math.max(movieRes.total_pages, tvRes.total_pages)
            totalResults = movieRes.total_results + tvRes.total_results
          } else {
            // 单一类型
            const res =
              mediaType === 'movie'
                ? await client.discover.movie(discoverParams)
                : await client.discover.tvShow(discoverParams)

            allResults = res.results.map((i: unknown) =>
              normalizeToMediaItem(i as Record<string, unknown>, mediaType),
            )
            totalPages = res.total_pages
            totalResults = res.total_results
          }

          set(state => {
            state.discoverResults = page > 1 ? [...state.discoverResults, ...allResults] : allResults
            state.discoverPagination = {
              page,
              totalPages,
              totalResults,
            }
            state.loading.discover = false
          })
        } catch (err: unknown) {
          console.error('Discover failed:', err)
          set(state => {
            state.error = (err as Error).message || 'Discover failed'
            state.loading.discover = false
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
            client.movies.nowPlaying({ language: getTmdbLanguage() }),
            client.tvShows.popular({ language: getTmdbLanguage() }),
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

      // 电影：最受欢迎
      fetchPopularMovies: async () => {
        const client = getTmdbClient()
        set(state => {
          state.loading.popularMovies = true
        })

        try {
          const res = await client.movies.popular({ language: getTmdbLanguage() })
          set(state => {
            state.popularMovies = res.results.map(i =>
              normalizeToMediaItem(i as unknown as Record<string, unknown>, 'movie'),
            )
            state.loading.popularMovies = false
          })
        } catch (err: unknown) {
          set(state => {
            state.error = (err as Error).message
            state.loading.popularMovies = false
          })
        }
      },

      // 电影：口碑最佳
      fetchTopRatedMovies: async () => {
        const client = getTmdbClient()
        set(state => {
          state.loading.topRatedMovies = true
        })

        try {
          const res = await client.movies.topRated({ language: getTmdbLanguage() })
          set(state => {
            state.topRatedMovies = res.results.map(i =>
              normalizeToMediaItem(i as unknown as Record<string, unknown>, 'movie'),
            )
            state.loading.topRatedMovies = false
          })
        } catch (err: unknown) {
          set(state => {
            state.error = (err as Error).message
            state.loading.topRatedMovies = false
          })
        }
      },

      // 电影：即将上映
      fetchUpcomingMovies: async () => {
        const client = getTmdbClient()
        set(state => {
          state.loading.upcomingMovies = true
        })

        try {
          const res = await client.movies.upcoming({ language: getTmdbLanguage() })
          set(state => {
            state.upcomingMovies = res.results.map(i =>
              normalizeToMediaItem(i as unknown as Record<string, unknown>, 'movie'),
            )
            state.loading.upcomingMovies = false
          })
        } catch (err: unknown) {
          set(state => {
            state.error = (err as Error).message
            state.loading.upcomingMovies = false
          })
        }
      },

      // 剧集：最受欢迎
      fetchPopularTv: async () => {
        const client = getTmdbClient()
        set(state => {
          state.loading.popularTv = true
        })

        try {
          const res = await client.tvShows.popular({ language: getTmdbLanguage() })
          set(state => {
            state.popularTv = res.results.map(i =>
              normalizeToMediaItem(i as unknown as Record<string, unknown>, 'tv'),
            )
            state.loading.popularTv = false
          })
        } catch (err: unknown) {
          set(state => {
            state.error = (err as Error).message
            state.loading.popularTv = false
          })
        }
      },

      // 剧集：口碑最佳
      fetchTopRatedTv: async () => {
        const client = getTmdbClient()
        set(state => {
          state.loading.topRatedTv = true
        })

        try {
          const res = await client.tvShows.topRated({ language: getTmdbLanguage() })
          set(state => {
            state.topRatedTv = res.results.map(i =>
              normalizeToMediaItem(i as unknown as Record<string, unknown>, 'tv'),
            )
            state.loading.topRatedTv = false
          })
        } catch (err: unknown) {
          set(state => {
            state.error = (err as Error).message
            state.loading.topRatedTv = false
          })
        }
      },

      // 剧集：今日播出
      fetchAiringTodayTv: async () => {
        const client = getTmdbClient()
        set(state => {
          state.loading.airingTodayTv = true
        })

        try {
          const res = await client.tvShows.airingToday({ language: getTmdbLanguage() })
          set(state => {
            state.airingTodayTv = res.results.map(i =>
              normalizeToMediaItem(i as unknown as Record<string, unknown>, 'tv'),
            )
            state.loading.airingTodayTv = false
          })
        } catch (err: unknown) {
          set(state => {
            state.error = (err as Error).message
            state.loading.airingTodayTv = false
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
            language: getTmdbLanguage(),
          })

          const baseResults = res.results
            .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
            .map(item =>
              normalizeToMediaItem(item as unknown as Record<string, unknown>, item.media_type),
            )

          // 并行获取每个项目的 logo
          const resultsWithLogos = await Promise.all(
            baseResults.map(async item => {
              try {
                // 根据媒体类型调用对应的 images 接口
                const images =
                  item.mediaType === 'movie'
                    ? await client.movies.images(item.id, {
                        include_image_language: ['zh', 'en', 'null'],
                      })
                    : await client.tvShows.images(item.id, {
                        include_image_language: ['zh', 'en', 'null'],
                      })

                // 选择最佳 logo: 优先中文 > 英文 > 无语言标记
                const logos = images.logos || []
                const bestLogo =
                  logos.find(l => l.iso_639_1 === 'zh') ||
                  logos.find(l => l.iso_639_1 === 'en') ||
                  logos.find(l => !l.iso_639_1) ||
                  logos[0]

                return {
                  ...item,
                  logoPath: bestLogo?.file_path ?? null,
                }
              } catch {
                // 获取 logo 失败不影响整体，保持 logoPath 为 null
                return item
              }
            }),
          )

          set(state => {
            state.trending = resultsWithLogos
            state.loading.trending = false
          })
        } catch (err: unknown) {
          set(state => {
            state.loading.trending = false
            state.error = (err as Error).message
          })
        }
      },

      // 推荐：根据指定的 movie/tv 获取推荐列表
      fetchRecommendations: async (id: number, mediaType: 'movie' | 'tv') => {
        const client = getTmdbClient()
        const { recommendationSourceId, recommendationSourceMediaType } = get()

        // 如果推荐来源未变化，不重新获取
        if (recommendationSourceId === id && recommendationSourceMediaType === mediaType) return

        set(state => {
          state.loading.recommendations = true
        })

        try {
          const res =
            mediaType === 'movie'
              ? await client.movies.recommendations(id, { language: getTmdbLanguage() })
              : await client.tvShows.recommendations(id, { language: getTmdbLanguage() })

          set(state => {
            state.recommendations = res.results.map(i =>
              normalizeToMediaItem(i as unknown as Record<string, unknown>, mediaType),
            )
            state.recommendationSourceId = id
            state.recommendationSourceMediaType = mediaType
            state.loading.recommendations = false
          })
        } catch (err: unknown) {
          set(state => {
            state.error = (err as Error).message
            state.loading.recommendations = false
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
