import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type {
  PlaylistMatchItem,
  SeasonSourceMatches,
  SourceBestMatch,
} from '@/features/media/components/tmdb-detail/playlistMatcher'

export interface TmdbMatchCachePayload {
  searchedKeyword: string
  candidates: PlaylistMatchItem[]
  movieSourceMatches: SourceBestMatch[]
  seasonSourceMatches: SeasonSourceMatches[]
}

export interface TmdbMatchCacheEntry {
  key: string
  createdAt: number
  payload: TmdbMatchCachePayload
}

interface TmdbMatchCacheState {
  entries: Record<string, TmdbMatchCacheEntry>
}

interface TmdbMatchCacheActions {
  getEntry: (key: string, ttlHours: number) => TmdbMatchCacheEntry | null
  setEntry: (key: string, payload: TmdbMatchCachePayload) => void
  clearEntries: () => void
  prune: (maxEntries: number) => void
}

type TmdbMatchCacheStore = TmdbMatchCacheState & TmdbMatchCacheActions

const HOUR_MS = 60 * 60 * 1000

export const useTmdbMatchCacheStore = create<TmdbMatchCacheStore>()(
  devtools(
    persist(
      immer<TmdbMatchCacheStore>((set, get) => ({
        entries: {},

        getEntry: (key: string, ttlHours: number) => {
          const entry = get().entries[key]
          if (!entry) return null

          const safeTTL = Math.max(1, ttlHours)
          const expired = Date.now() - entry.createdAt > safeTTL * HOUR_MS
          if (expired) {
            set(state => {
              delete state.entries[key]
            })
            return null
          }

          return entry
        },

        setEntry: (key: string, payload: TmdbMatchCachePayload) => {
          set(state => {
            state.entries[key] = {
              key,
              createdAt: Date.now(),
              payload,
            }
          })
        },

        clearEntries: () => {
          set(state => {
            state.entries = {}
          })
        },

        prune: (maxEntries: number) => {
          const safeLimit = Math.max(1, Math.floor(maxEntries))
          const list = Object.values(get().entries)
          if (list.length <= safeLimit) return

          const kept = list
            .slice()
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, safeLimit)

          const nextEntries: Record<string, TmdbMatchCacheEntry> = {}
          kept.forEach(entry => {
            nextEntries[entry.key] = entry
          })

          set(state => {
            state.entries = nextEntries
          })
        },
      })),
      {
        name: 'ouonnki-tv-tmdb-match-cache-store',
        version: 1,
        partialize: state => ({ entries: state.entries }),
      },
    ),
    {
      name: 'TmdbMatchCacheStore',
    },
  ),
)
