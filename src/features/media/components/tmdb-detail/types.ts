import type { TmdbMovieDetail, TmdbTvDetail } from '@/shared/types/tmdb'

export interface DetailGenre {
  id: number
  name: string
}

export interface DetailCast {
  id: number
  name: string
  character?: string
  order?: number
  profile_path?: string | null
}

export interface DetailCredits {
  cast?: DetailCast[]
}

export interface DetailRecommendationRaw {
  id: number
  title?: string
  name?: string
  original_title?: string
  original_name?: string
  overview?: string
  poster_path?: string | null
  backdrop_path?: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
  vote_count?: number
  popularity?: number
  genre_ids?: number[]
  original_language?: string
  origin_country?: string[]
}

export interface DetailRecommendationBlock {
  results?: DetailRecommendationRaw[]
}

export interface DetailKeyword {
  id: number
  name: string
}

export interface DetailKeywordsBlock {
  keywords?: DetailKeyword[]
  results?: DetailKeyword[]
}

export interface DetailImage {
  file_path: string
  iso_639_1?: string | null
  vote_average?: number
  vote_count?: number
}

export interface DetailImagesBlock {
  logos?: DetailImage[]
}

export interface DetailCompany {
  id: number
  name: string
  origin_country?: string
}

export interface DetailCountry {
  iso_3166_1: string
  name: string
}

export interface DetailSpokenLanguage {
  iso_639_1: string
  english_name: string
  name: string
}

export interface DetailCreatedBy {
  id: number
  name: string
}

export interface DetailNetwork {
  id: number
  name: string
  origin_country?: string
}

export interface DetailSeason {
  id: number
  season_number: number
  name: string
  episode_count: number
  overview?: string
  air_date?: string
  poster_path?: string | null
}

export interface DetailEpisodeBrief {
  name?: string
  season_number?: number
  episode_number?: number
}

export interface DetailBelongsToCollection {
  name: string
}

export interface DetailInfoField {
  label: string
  value: string
}

export type DetailTab = 'overview' | 'playlist' | 'production' | 'cast' | 'seasons'

export type TmdbRichDetail = (TmdbMovieDetail | TmdbTvDetail) & {
  id: number
  adult?: boolean
  video?: boolean
  tagline?: string
  status?: string
  type?: string
  genres?: DetailGenre[]
  runtime?: number
  budget?: number
  revenue?: number
  imdb_id?: string | null
  belongs_to_collection?: DetailBelongsToCollection
  homepage?: string
  production_companies?: DetailCompany[]
  production_countries?: DetailCountry[]
  spoken_languages?: DetailSpokenLanguage[]
  first_air_date?: string
  last_air_date?: string
  in_production?: boolean
  created_by?: DetailCreatedBy[]
  networks?: DetailNetwork[]
  episode_run_time?: number[]
  number_of_seasons?: number
  number_of_episodes?: number
  seasons?: DetailSeason[]
  last_episode_to_air?: DetailEpisodeBrief
  next_episode_to_air?: DetailEpisodeBrief | null
  credits?: DetailCredits
  recommendations?: DetailRecommendationBlock
  similar?: DetailRecommendationBlock
  keywords?: DetailKeywordsBlock
  images?: DetailImagesBlock
}
