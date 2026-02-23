import { useSettingStore } from '@/shared/store/settingStore'

/** 获取当前 TMDB 模式是否启用（React hook） */
export function useTmdbEnabled(): boolean {
  return useSettingStore(state => state.system.tmdbEnabled)
}

/** 非 hook 场景下获取 TMDB 模式状态 */
export function isTmdbEnabled(): boolean {
  return useSettingStore.getState().system.tmdbEnabled
}
