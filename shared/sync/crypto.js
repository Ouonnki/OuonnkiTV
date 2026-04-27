import { createHmac, randomBytes, randomUUID, scrypt as nodeScrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(nodeScrypt)
const SCRYPT_KEY_LENGTH = 64
const PASSWORD_SEPARATOR = ':'

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = await scrypt(password, salt, SCRYPT_KEY_LENGTH)
  return `${salt}${PASSWORD_SEPARATOR}${Buffer.from(derivedKey).toString('hex')}`
}

export async function verifyPassword(password, passwordHash) {
  const [salt, storedKey] = passwordHash.split(PASSWORD_SEPARATOR)
  if (!salt || !storedKey) return false

  const derivedKey = await scrypt(password, salt, SCRYPT_KEY_LENGTH)
  const storedBuffer = Buffer.from(storedKey, 'hex')
  const candidateBuffer = Buffer.from(derivedKey)

  if (storedBuffer.length !== candidateBuffer.length) return false
  return timingSafeEqual(storedBuffer, candidateBuffer)
}

export function createSessionToken() {
  return `${randomUUID()}${randomBytes(24).toString('hex')}`
}

export function hashSessionToken(token, secret) {
  return createHmac('sha256', secret).update(token).digest('hex')
}
