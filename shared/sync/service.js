import { randomUUID } from 'node:crypto'
import { createExpiredSessionCookie, createSessionCookie } from './cookies.js'
import { createSessionToken, hashPassword, hashSessionToken, verifyPassword } from './crypto.js'
import { mergeSyncSnapshots } from './merge.js'
import {
  authCredentialsSchema,
  createEmptySyncSnapshot,
  syncStateUpdateRequestSchema,
} from './schema.js'

function buildResponse(status, body, setCookie) {
  return { status, body, setCookie }
}

function buildErrorResponse(status, message) {
  return buildResponse(status, { error: message })
}

function buildAuthSessionPayload(user, session) {
  return {
    user: {
      id: user.id,
      username: user.username,
    },
    issuedAt: session.createdAt.toISOString(),
    expiresAt: session.expiresAt.toISOString(),
  }
}

export function createSyncService({
  repo,
  sessionSecret,
  sessionCookieName,
  sessionMaxAgeMs = 1000 * 60 * 60 * 24 * 30,
  now = () => new Date(),
}) {
  async function authenticate(sessionToken) {
    if (!sessionToken) return null

    const tokenHash = hashSessionToken(sessionToken, sessionSecret)
    const record = await repo.getSessionByTokenHash(tokenHash)
    if (!record) return null

    const currentTime = now()
    if (record.session.expiresAt <= currentTime) {
      await repo.deleteSessionByTokenHash(tokenHash)
      return null
    }

    await repo.touchSession(record.session.id, currentTime)
    return record
  }

  async function issueSession(user, secureCookie) {
    const createdAt = now()
    const expiresAt = new Date(createdAt.getTime() + sessionMaxAgeMs)
    const token = createSessionToken()
    const tokenHash = hashSessionToken(token, sessionSecret)
    const session = {
      id: randomUUID(),
      userId: user.id,
      tokenHash,
      createdAt,
      expiresAt,
      lastSeenAt: createdAt,
    }

    await repo.createSession(session)

    return {
      session,
      cookie: createSessionCookie(token, {
        name: sessionCookieName,
        secure: secureCookie,
        maxAgeSeconds: Math.floor(sessionMaxAgeMs / 1000),
      }),
    }
  }

  return {
    async register(body, secureCookie) {
      const parsed = authCredentialsSchema.safeParse(body)
      if (!parsed.success) {
        return buildErrorResponse(400, parsed.error.issues[0]?.message || 'Invalid request body')
      }

      const normalizedUsername = parsed.data.username.toLowerCase()
      const existingUser = await repo.findUserByNormalizedUsername(normalizedUsername)
      if (existingUser) {
        return buildErrorResponse(409, 'Username already exists')
      }

      const user = {
        id: randomUUID(),
        username: normalizedUsername,
        normalizedUsername,
        passwordHash: await hashPassword(parsed.data.password),
        createdAt: now(),
      }

      try {
        await repo.createUser(user)
      } catch (error) {
        if (error instanceof Error && error.code === 'DUPLICATE_USERNAME') {
          return buildErrorResponse(409, 'Username already exists')
        }
        throw error
      }

      const { session, cookie } = await issueSession(user, secureCookie)
      return buildResponse(201, { session: buildAuthSessionPayload(user, session) }, cookie)
    },

    async login(body, secureCookie) {
      const parsed = authCredentialsSchema.safeParse(body)
      if (!parsed.success) {
        return buildErrorResponse(400, parsed.error.issues[0]?.message || 'Invalid request body')
      }

      const normalizedUsername = parsed.data.username.toLowerCase()
      const user = await repo.findUserByNormalizedUsername(normalizedUsername)
      if (!user) {
        return buildErrorResponse(401, 'Invalid username or password')
      }

      const isValidPassword = await verifyPassword(parsed.data.password, user.passwordHash)
      if (!isValidPassword) {
        return buildErrorResponse(401, 'Invalid username or password')
      }

      const { session, cookie } = await issueSession(user, secureCookie)
      return buildResponse(200, { session: buildAuthSessionPayload(user, session) }, cookie)
    },

    async logout(sessionToken, secureCookie) {
      if (sessionToken) {
        const tokenHash = hashSessionToken(sessionToken, sessionSecret)
        await repo.deleteSessionByTokenHash(tokenHash)
      }

      return buildResponse(
        200,
        { ok: true },
        createExpiredSessionCookie({ name: sessionCookieName, secure: secureCookie }),
      )
    },

    async getSession(sessionToken) {
      const record = await authenticate(sessionToken)
      if (!record) {
        return buildResponse(200, { session: null })
      }

      return buildResponse(200, {
        session: buildAuthSessionPayload(record.user, record.session),
      })
    },

    async getState(sessionToken) {
      const record = await authenticate(sessionToken)
      if (!record) {
        return buildErrorResponse(401, 'Unauthorized')
      }

      const syncState = await repo.getSyncState(record.user.id)
      return buildResponse(200, {
        snapshot: syncState?.snapshot ?? createEmptySyncSnapshot(now().getTime()),
        revision: syncState?.revision ?? 0,
        updatedAt: syncState?.updatedAt?.toISOString() ?? null,
        hasState: Boolean(syncState),
        merged: false,
      })
    },

    async updateState(sessionToken, body) {
      const record = await authenticate(sessionToken)
      if (!record) {
        return buildErrorResponse(401, 'Unauthorized')
      }

      const parsed = syncStateUpdateRequestSchema.safeParse(body)
      if (!parsed.success) {
        return buildErrorResponse(400, parsed.error.issues[0]?.message || 'Invalid request body')
      }

      const currentState = await repo.getSyncState(record.user.id)
      const hasConflict = currentState ? currentState.revision !== parsed.data.revision : false
      const mergedSnapshot = currentState && hasConflict
        ? mergeSyncSnapshots(currentState.snapshot, parsed.data.snapshot)
        : parsed.data.snapshot
      const revision = (currentState?.revision ?? 0) + 1
      const updatedAt = now()

      await repo.upsertSyncState({
        userId: record.user.id,
        snapshot: mergedSnapshot,
        revision,
        updatedAt,
      })

      return buildResponse(200, {
        snapshot: mergedSnapshot,
        revision,
        updatedAt: updatedAt.toISOString(),
        hasState: true,
        merged: hasConflict,
      })
    },
  }
}
