export type TmdbMediaType = 'movie' | 'tv'

// 通用媒体项 (搜索结果统一类型)
export interface TmdbMediaItem {
  id: number
  mediaType: TmdbMediaType
  title: string // movie: title, tv: name
  originalTitle: string // movie: original_title, tv: original_name
  overview: string
  posterPath: string | null
  backdropPath: string | null
  logoPath: string | null // 标题 logo 图片路径
  releaseDate: string // movie: release_date, tv: first_air_date
  voteAverage: number
  voteCount: number
  popularity: number
  genreIds: number[]
  originalLanguage: string
  originCountry: string[] // 产地国家代码列表 (tv通常是数组，movie可能需要从可以获取的地方获取，或者统一为空数组如果API不直接提供)
  // Note: 'movie' search results in TMDB API usually don't have origin_country strictly like TV,
  // but details do. For simple search results, we might rely on original_language or fetch details if critical.
  // However, discovery API allows filtering by region.
  // Let's stick to what's common or available.
  // TV implies origin_country: string[]. Movie results usually don't have it in list.
  // We will make it optional or handle it in normalization.
}

// 电影详情 (扩展)
export interface TmdbMovieDetail extends TmdbMediaItem {
  runtime: number
  status: string
  tagline: string
  // ... other fields
}

// 剧集详情 (扩展)
export interface TmdbTvDetail extends TmdbMediaItem {
  numberOfEpisodes: number
  numberOfSeasons: number
  status: string
  // ... other fields
}

// 分类信息
export interface TmdbGenre {
  id: number
  name: string
}

// 国家/地区信息
export interface TmdbCountry {
  iso_3166_1: string
  english_name: string
  native_name: string
}

// 筛选条件
export interface TmdbFilterOptions {
  mediaType?: TmdbMediaType | 'all'
  genreIds?: number[]
  originCountry?: string // ISO 3166-1 code
  minVoteAverage?: number
  releaseYear?: number
  sortBy?: 'popularity' | 'vote_average' | 'release_date'
  sortOrder?: 'asc' | 'desc'
}

// 筛选选项列表 (向 UI 暴露可用的筛选值)
export interface TmdbFilterAvailableOptions {
  genres: TmdbGenre[]
  countries: TmdbCountry[]
  years: number[]
  mediaTypes: TmdbMediaType[]
}

// 分页信息
export interface TmdbPagination {
  page: number
  totalPages: number
  totalResults: number
}
