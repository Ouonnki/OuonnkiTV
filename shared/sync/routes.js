import { getSyncCookieName, getHeader, isSecureRequest, parseCookies } from './cookies.js'
import { getSyncRuntime } from './runtime.js'

function createErrorResponse(error) {
  console.error('[sync]', error)
  return {
    status: 500,
    body: {
      error: error instanceof Error ? error.message : 'Internal server error',
    },
  }
}

function readSessionToken(headers) {
  const cookieHeader = getHeader(headers, 'cookie')
  const cookies = parseCookies(cookieHeader)
  return cookies[getSyncCookieName()] ?? null
}

async function execute(handler) {
  try {
    return await handler()
  } catch (error) {
    return createErrorResponse(error)
  }
}

export async function handleSyncRegister(request) {
  return execute(async () => {
    return getSyncRuntime().service.register(request.body, isSecureRequest(request.headers))
  })
}

export async function handleSyncLogin(request) {
  return execute(async () => {
    return getSyncRuntime().service.login(request.body, isSecureRequest(request.headers))
  })
}

export async function handleSyncLogout(request) {
  return execute(async () => {
    return getSyncRuntime().service.logout(
      readSessionToken(request.headers),
      isSecureRequest(request.headers),
    )
  })
}

export async function handleSyncSession(request) {
  return execute(async () => {
    return getSyncRuntime().service.getSession(readSessionToken(request.headers))
  })
}

export async function handleSyncGetState(request) {
  return execute(async () => {
    return getSyncRuntime().service.getState(readSessionToken(request.headers))
  })
}

export async function handleSyncPutState(request) {
  return execute(async () => {
    return getSyncRuntime().service.updateState(readSessionToken(request.headers), request.body)
  })
}
