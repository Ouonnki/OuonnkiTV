const DEFAULT_COOKIE_NAME = 'ouonnki_sync_session'
const LOCALHOST_HOSTS = new Set(['localhost', '127.0.0.1'])

export function getSyncCookieName() {
  return process.env.SYNC_SESSION_COOKIE_NAME || DEFAULT_COOKIE_NAME
}

export function getHeader(headers, name) {
  if (!headers) return ''
  const matchedKey = Object.keys(headers).find(key => key.toLowerCase() === name.toLowerCase())
  if (!matchedKey) return ''

  const value = headers[matchedKey]
  if (Array.isArray(value)) return value.join('; ')
  return typeof value === 'string' ? value : ''
}

export function parseCookies(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map(part => part.trim())
    .filter(Boolean)
    .reduce((accumulator, part) => {
      const separatorIndex = part.indexOf('=')
      if (separatorIndex === -1) return accumulator

      const key = part.slice(0, separatorIndex).trim()
      const value = part.slice(separatorIndex + 1).trim()
      if (!key) return accumulator

      accumulator[key] = decodeURIComponent(value)
      return accumulator
    }, {})
}

export function isSecureRequest(headers) {
  const forwardedProto = getHeader(headers, 'x-forwarded-proto')
  if (forwardedProto) {
    return forwardedProto.split(',')[0].trim() === 'https'
  }

  const host = getHeader(headers, 'host').split(':')[0].trim().toLowerCase()
  if (!host) return process.env.NODE_ENV === 'production'
  return !LOCALHOST_HOSTS.has(host)
}

function serializeCookiePart(key, value) {
  return `${key}=${value}`
}

export function createSessionCookie(value, options = {}) {
  const name = options.name || getSyncCookieName()
  const maxAge = Math.max(0, Math.floor(options.maxAgeSeconds ?? 60 * 60 * 24 * 30))
  const cookieParts = [
    serializeCookiePart(name, encodeURIComponent(value)),
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ]

  if (options.secure) {
    cookieParts.push('Secure')
  }

  return cookieParts.join('; ')
}

export function createExpiredSessionCookie(options = {}) {
  const name = options.name || getSyncCookieName()
  const cookieParts = [
    serializeCookiePart(name, ''),
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  ]

  if (options.secure) {
    cookieParts.push('Secure')
  }

  return cookieParts.join('; ')
}
