type SyncServiceResponse = {
  status: number
  body: unknown
  setCookie?: string
}

type SyncService = {
  register: (body: unknown, secureCookie: boolean) => Promise<SyncServiceResponse>
  login: (body: unknown, secureCookie: boolean) => Promise<SyncServiceResponse>
  logout: (sessionToken: string | null, secureCookie: boolean) => Promise<SyncServiceResponse>
  getSession: (sessionToken: string | null) => Promise<SyncServiceResponse>
  getState: (sessionToken: string | null) => Promise<SyncServiceResponse>
  updateState: (sessionToken: string | null, body: unknown) => Promise<SyncServiceResponse>
}

export function createSyncService(options: {
  repo: object
  sessionSecret: string
  sessionCookieName: string
  sessionMaxAgeMs?: number
  now?: () => Date
}): SyncService
