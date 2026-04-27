import { collectLocalSyncSnapshot } from './snapshot'
import { useSyncStore } from '../store/syncStore'
import type { SyncStateResponse } from '../types'

export const AUTO_PUSH_DEBOUNCE_MS = 800
export const AUTO_PULL_INTERVAL_MS = 60_000
export const SYNC_FAILED_MESSAGE = '\u540c\u6b65\u5931\u8d25'
export const UNINITIALIZED_MESSAGE = 'Sync manager callback is not initialized'

export type SyncSnapshot = ReturnType<typeof collectLocalSyncSnapshot>
export type SnapshotWithHash = {
  snapshot: SyncSnapshot
  hash: string
}
export type SyncTask = () => Promise<void>
export type PushTask = (snapshot?: SnapshotWithHash) => Promise<void>
export type SnapshotTask = (snapshot: SyncSnapshot) => Promise<void>

export const failUninitialized = (): void => {
  throw new Error(UNINITIALIZED_MESSAGE)
}

export const failUninitializedAsync = async (): Promise<never> => {
  throw new Error(UNINITIALIZED_MESSAGE)
}

export const failUninitializedSnapshotAsync = async (snapshot: SyncSnapshot): Promise<never> => {
  void snapshot
  throw new Error(UNINITIALIZED_MESSAGE)
}

export const failUninitializedPushAsync = async (snapshot?: SnapshotWithHash): Promise<never> => {
  void snapshot
  throw new Error(UNINITIALIZED_MESSAGE)
}

export const collectSnapshotWithHash = (): SnapshotWithHash => {
  const snapshot = collectLocalSyncSnapshot()
  return { snapshot, hash: JSON.stringify(snapshot) }
}

export const getErrorMessage = (error: unknown, fallback: string): string => {
  return error instanceof Error ? error.message : fallback
}

export const setSyncError = (message: string | null) => {
  useSyncStore.getState().setLastError(message)
}

export const setSyncing = (isSyncing: boolean) => {
  useSyncStore.getState().setSyncing(isSyncing)
}

export const applyRemoteState = (payload: Pick<SyncStateResponse, 'hasState' | 'revision' | 'updatedAt'>) => {
  useSyncStore.getState().setRemoteState({
    hasRemoteState: payload.hasState,
    remoteRevision: payload.revision,
    lastSyncedAt: payload.updatedAt,
  })
}
