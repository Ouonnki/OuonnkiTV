import { create } from 'zustand'
import type { AuthSessionPayload } from '../types'

type SyncCredentials = {
  username: string
  password: string
}

type SyncStoreState = {
  session: AuthSessionPayload | null
  isInitialized: boolean
  isCheckingSession: boolean
  isSyncing: boolean
  hasRemoteState: boolean
  remoteRevision: number
  lastSyncedAt: string | null
  lastError: string | null
  login: (credentials: SyncCredentials) => Promise<void>
  register: (credentials: SyncCredentials) => Promise<void>
  logout: () => Promise<void>
  syncNow: () => Promise<void>
  setSession: (session: AuthSessionPayload | null) => void
  setInitialized: (initialized: boolean) => void
  setCheckingSession: (isCheckingSession: boolean) => void
  setSyncing: (isSyncing: boolean) => void
  setRemoteState: (payload: {
    hasRemoteState: boolean
    remoteRevision: number
    lastSyncedAt: string | null
  }) => void
  setLastError: (message: string | null) => void
  bindActions: (actions: Pick<SyncStoreState, 'login' | 'register' | 'logout' | 'syncNow'>) => void
}

const unboundAction = async (): Promise<void> => {
  throw new Error('Sync manager is not ready yet')
}

export const useSyncStore = create<SyncStoreState>(set => ({
  session: null,
  isInitialized: false,
  isCheckingSession: true,
  isSyncing: false,
  hasRemoteState: false,
  remoteRevision: 0,
  lastSyncedAt: null,
  lastError: null,
  login: unboundAction,
  register: unboundAction,
  logout: unboundAction,
  syncNow: unboundAction,
  setSession: session => set({ session }),
  setInitialized: isInitialized => set({ isInitialized }),
  setCheckingSession: isCheckingSession => set({ isCheckingSession }),
  setSyncing: isSyncing => set({ isSyncing }),
  setRemoteState: ({ hasRemoteState, remoteRevision, lastSyncedAt }) =>
    set({ hasRemoteState, remoteRevision, lastSyncedAt }),
  setLastError: lastError => set({ lastError }),
  bindActions: actions => set(actions),
}))
