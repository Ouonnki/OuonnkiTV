import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useFavoritesStore } from '@/features/favorites/store/favoritesStore'
import { useThemeStore } from '@/shared/components/theme'
import { useApiStore } from '@/shared/store/apiStore'
import { useSearchStore } from '@/shared/store/searchStore'
import { useSettingStore } from '@/shared/store/settingStore'
import { useSubscriptionStore } from '@/shared/store/subscriptionStore'
import { useViewingHistoryStore } from '@/shared/store/viewingHistoryStore'
import {
  fetchSyncSession,
  fetchSyncState,
  loginSyncAccount,
  logoutSyncAccount,
  registerSyncAccount,
  updateSyncState,
} from '../api/client'
import { mergeSyncSnapshots } from '../lib/merge'
import {
  applySyncSnapshot,
  clearSyncManagedLocalData,
  collectLocalSyncSnapshot,
} from '../lib/snapshot'
import {
  applyRemoteState,
  AUTO_PULL_INTERVAL_MS,
  AUTO_PUSH_DEBOUNCE_MS,
  collectSnapshotWithHash,
  failUninitialized,
  failUninitializedAsync,
  failUninitializedPushAsync,
  failUninitializedSnapshotAsync,
  getErrorMessage,
  setSyncError,
  setSyncing,
  SYNC_FAILED_MESSAGE,
  type PushTask,
  type SnapshotTask,
  type SyncSnapshot,
  type SyncTask,
} from '../lib/managerShared'
import { useSyncStore } from '../store/syncStore'
export const useSyncManager = (): void => {
  const { setTheme } = useTheme()
  const session = useSyncStore(state => state.session)
  const applyingRef = useRef(false)
  const initializedRef = useRef(false)
  const lastSnapshotHashRef = useRef('')
  const pushTimeoutRef = useRef<number | null>(null)
  const syncInFlightRef = useRef(false)
  const setThemeRef = useRef(setTheme)
  const applySnapshotSilentlyRef = useRef<SnapshotTask>(failUninitializedSnapshotAsync)
  const hydrateFromRemoteRef = useRef<SyncTask>(failUninitializedAsync)
  const pushSnapshotRef = useRef<PushTask>(failUninitializedPushAsync)
  const schedulePushRef = useRef(failUninitialized)
  setThemeRef.current = setTheme
  const applySnapshotSilently = async (snapshot: SyncSnapshot) => {
    applyingRef.current = true
    try {
      await applySyncSnapshot(snapshot, { setThemeMode: setThemeRef.current })
    } finally {
      applyingRef.current = false
    }
  }
  const pushSnapshot = async (nextSnapshot = collectSnapshotWithHash()) => {
    if (syncInFlightRef.current || !useSyncStore.getState().session) return
    if (nextSnapshot.hash === lastSnapshotHashRef.current) return
    syncInFlightRef.current = true
    setSyncing(true)
    setSyncError(null)
    try {
      const response = await updateSyncState({
        revision: useSyncStore.getState().remoteRevision,
        snapshot: nextSnapshot.snapshot,
      })
      const responseHash = JSON.stringify(response.snapshot)
      if (responseHash !== nextSnapshot.hash) {
        await applySnapshotSilentlyRef.current(response.snapshot)
      }
      lastSnapshotHashRef.current = responseHash
      applyRemoteState(response)
    } catch (error) {
      const message = getErrorMessage(error, SYNC_FAILED_MESSAGE)
      setSyncError(message)
      toast.error(`\u540c\u6b65\u5931\u8d25\uff1a${message}`)
    } finally {
      syncInFlightRef.current = false
      setSyncing(false)
    }
  }
  const hydrateFromRemote = async () => {
    if (syncInFlightRef.current || !useSyncStore.getState().session) return
    syncInFlightRef.current = true
    setSyncing(true)
    setSyncError(null)
    try {
      const remoteState = await fetchSyncState()
      const localState = collectSnapshotWithHash()
      const remoteHash = JSON.stringify(remoteState.snapshot)
      const mergedSnapshot = remoteState.hasState
        ? mergeSyncSnapshots(remoteState.snapshot, localState.snapshot)
        : localState.snapshot
      const mergedHash = JSON.stringify(mergedSnapshot)
      if (mergedHash !== localState.hash) {
        await applySnapshotSilentlyRef.current(mergedSnapshot)
      }
      applyRemoteState(remoteState)
      if (remoteState.hasState && mergedHash === remoteHash) {
        lastSnapshotHashRef.current = mergedHash
        return
      }
      const pushedState = await updateSyncState({
        revision: remoteState.revision,
        snapshot: mergedSnapshot,
      })
      const pushedHash = JSON.stringify(pushedState.snapshot)
      if (pushedHash !== mergedHash) {
        await applySnapshotSilentlyRef.current(pushedState.snapshot)
      }
      lastSnapshotHashRef.current = pushedHash
      applyRemoteState(pushedState)
    } catch (error) {
      const message = getErrorMessage(error, SYNC_FAILED_MESSAGE)
      setSyncError(message)
      toast.error(`\u540c\u6b65\u5931\u8d25\uff1a${message}`)
    } finally {
      syncInFlightRef.current = false
      setSyncing(false)
    }
  }
  const schedulePush = () => {
    if (!initializedRef.current || applyingRef.current || !useSyncStore.getState().session) return
    if (pushTimeoutRef.current !== null) {
      window.clearTimeout(pushTimeoutRef.current)
    }
    pushTimeoutRef.current = window.setTimeout(() => {
      void pushSnapshotRef.current(collectSnapshotWithHash())
    }, AUTO_PUSH_DEBOUNCE_MS)
  }
  applySnapshotSilentlyRef.current = applySnapshotSilently
  hydrateFromRemoteRef.current = hydrateFromRemote
  pushSnapshotRef.current = pushSnapshot
  schedulePushRef.current = schedulePush
  useEffect(() => {
    const authenticate = async (
      mode: 'login' | 'register',
      credentials: { username: string; password: string },
    ) => {
      setSyncing(true)
      setSyncError(null)
      try {
        const response =
          mode === 'login'
            ? await loginSyncAccount(credentials)
            : await registerSyncAccount(credentials)
        useSyncStore.getState().setSession(response.session)
        await hydrateFromRemoteRef.current()
        toast.success(
          mode === 'login'
            ? '\u540c\u6b65\u8d26\u53f7\u767b\u5f55\u6210\u529f'
            : '\u540c\u6b65\u8d26\u53f7\u6ce8\u518c\u6210\u529f',
        )
      } catch (error) {
        const message = getErrorMessage(error, '\u8ba4\u8bc1\u5931\u8d25')
        setSyncError(message)
        toast.error(message)
        throw error
      } finally {
        setSyncing(false)
      }
    }
    const logout = async () => {
      setSyncing(true)
      setSyncError(null)
      try {
        await logoutSyncAccount()
        useSyncStore.getState().setSession(null)
        useSyncStore.getState().setRemoteState({
          hasRemoteState: false,
          remoteRevision: 0,
          lastSyncedAt: null,
        })
        lastSnapshotHashRef.current = ''
        await clearSyncManagedLocalData({ setThemeMode: setThemeRef.current })
        toast.success('\u5df2\u9000\u51fa\u540c\u6b65\u8d26\u53f7')
      } catch (error) {
        const message = getErrorMessage(error, '\u9000\u51fa\u5931\u8d25')
        setSyncError(message)
        toast.error(message)
        throw error
      } finally {
        setSyncing(false)
      }
    }

    useSyncStore.getState().bindActions({
      login: credentials => authenticate('login', credentials),
      register: credentials => authenticate('register', credentials),
      logout,
      syncNow: () => hydrateFromRemoteRef.current(),
    })
  }, [])
  useEffect(() => {
    const unsubscribeFavorites = useFavoritesStore.subscribe((state, previousState) => {
      if (state.favorites !== previousState.favorites) schedulePushRef.current()
    })
    const unsubscribeHistory = useViewingHistoryStore.subscribe((state, previousState) => {
      if (state.viewingHistory !== previousState.viewingHistory) schedulePushRef.current()
    })
    const unsubscribeSearch = useSearchStore.subscribe((state, previousState) => {
      if (state.searchHistory !== previousState.searchHistory) schedulePushRef.current()
    })
    const unsubscribeTheme = useThemeStore.subscribe((state, previousState) => {
      if (state.mode !== previousState.mode || state.modeUpdatedAt !== previousState.modeUpdatedAt) {
        schedulePushRef.current()
      }
    })
    const unsubscribeSettings = useSettingStore.subscribe((state, previousState) => {
      const changed =
        state.network !== previousState.network ||
        state.search !== previousState.search ||
        state.playback !== previousState.playback ||
        state.system !== previousState.system ||
        state.syncMeta !== previousState.syncMeta
      if (changed) schedulePushRef.current()
    })
    const unsubscribeApi = useApiStore.subscribe((state, previousState) => {
      const changed =
        state.videoAPIs !== previousState.videoAPIs ||
        state.adFilteringEnabled !== previousState.adFilteringEnabled ||
        state.adFilteringUpdatedAt !== previousState.adFilteringUpdatedAt
      if (changed) schedulePushRef.current()
    })
    const unsubscribeSubscriptions = useSubscriptionStore.subscribe((state, previousState) => {
      if (state.subscriptions !== previousState.subscriptions) schedulePushRef.current()
    })
    const bootstrap = async () => {
      useSyncStore.getState().setCheckingSession(true)
      setSyncError(null)
      try {
        const response = await fetchSyncSession()
        useSyncStore.getState().setSession(response.session)
        initializedRef.current = true
        if (response.session) {
          await hydrateFromRemoteRef.current()
        } else {
          lastSnapshotHashRef.current = JSON.stringify(collectLocalSyncSnapshot())
        }
      } catch (error) {
        setSyncError(getErrorMessage(error, '\u4f1a\u8bdd\u68c0\u67e5\u5931\u8d25'))
      } finally {
        useSyncStore.getState().setCheckingSession(false)
        useSyncStore.getState().setInitialized(true)
      }
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && useSyncStore.getState().session) {
        void hydrateFromRemoteRef.current()
      }
    }
    void bootstrap()
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      unsubscribeFavorites()
      unsubscribeHistory()
      unsubscribeSearch()
      unsubscribeTheme()
      unsubscribeSettings()
      unsubscribeApi()
      unsubscribeSubscriptions()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (pushTimeoutRef.current !== null) {
        window.clearTimeout(pushTimeoutRef.current)
      }
    }
  }, [])
  useEffect(() => {
    if (!session) return
    const intervalId = window.setInterval(() => {
      void hydrateFromRemoteRef.current()
    }, AUTO_PULL_INTERVAL_MS)
    return () => {
      window.clearInterval(intervalId)
    }
  }, [session])
}
