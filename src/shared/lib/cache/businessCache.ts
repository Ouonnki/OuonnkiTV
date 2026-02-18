import { useTmdbMatchCacheStore } from '@/shared/store/tmdbMatchCacheStore'

/**
 * 统一清理业务缓存入口。
 * 当前仅清理 TMDB 匹配缓存，后续可在此扩展。
 */
export function clearBusinessCaches() {
  useTmdbMatchCacheStore.getState().clearEntries()
}
