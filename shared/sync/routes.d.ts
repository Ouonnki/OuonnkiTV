export type SyncRequestContext = {
  body?: unknown
  headers: Record<string, string | string[] | undefined>
}

export type SyncHandlerResponse = {
  status: number
  body: unknown
  setCookie?: string
}

export function handleSyncRegister(request: SyncRequestContext): Promise<SyncHandlerResponse>
export function handleSyncLogin(request: SyncRequestContext): Promise<SyncHandlerResponse>
export function handleSyncLogout(request: SyncRequestContext): Promise<SyncHandlerResponse>
export function handleSyncSession(request: SyncRequestContext): Promise<SyncHandlerResponse>
export function handleSyncGetState(request: SyncRequestContext): Promise<SyncHandlerResponse>
export function handleSyncPutState(request: SyncRequestContext): Promise<SyncHandlerResponse>
