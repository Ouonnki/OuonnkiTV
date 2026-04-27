import type {
  AuthSessionPayload,
  SyncStateResponse,
  SyncStateUpdateRequest,
} from '../types'

type SessionResponse = {
  session: AuthSessionPayload | null
}

type AuthCredentials = {
  username: string
  password: string
}

type AuthResponse = {
  session: AuthSessionPayload
}

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string
  } & T

  if (!response.ok) {
    throw new Error(payload.error || `Request failed with status ${response.status}`)
  }

  return payload
}

export const registerSyncAccount = (body: AuthCredentials): Promise<AuthResponse> => {
  return request<AuthResponse>('/api/sync/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const loginSyncAccount = (body: AuthCredentials): Promise<AuthResponse> => {
  return request<AuthResponse>('/api/sync/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const logoutSyncAccount = (): Promise<{ ok: true }> => {
  return request<{ ok: true }>('/api/sync/auth/logout', {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export const fetchSyncSession = (): Promise<SessionResponse> => {
  return request<SessionResponse>('/api/sync/session', {
    method: 'GET',
  })
}

export const fetchSyncState = (): Promise<SyncStateResponse> => {
  return request<SyncStateResponse>('/api/sync/state', {
    method: 'GET',
  })
}

export const updateSyncState = (body: SyncStateUpdateRequest): Promise<SyncStateResponse> => {
  return request<SyncStateResponse>('/api/sync/state', {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}
