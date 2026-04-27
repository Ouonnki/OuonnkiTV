// @vitest-environment node

import { describe, expect, it } from 'vitest'
import { FavoriteWatchStatus } from '@/features/favorites/types/favorites'
import type { SyncSnapshot } from './types'
import { createEmptySyncSnapshot } from '../../../shared/sync/schema.js'
import { createSyncService } from '../../../shared/sync/service.js'

type StoredUser = {
  id: string
  username: string
  normalizedUsername: string
  passwordHash: string
  createdAt: Date
}

type StoredSession = {
  id: string
  userId: string
  tokenHash: string
  expiresAt: Date
  createdAt: Date
  lastSeenAt: Date
}

type StoredSyncState = {
  userId: string
  snapshot: SyncSnapshot
  revision: number
  updatedAt: Date
}

class InMemorySyncRepository {
  users = new Map<string, StoredUser>()
  usersByName = new Map<string, StoredUser>()
  sessions = new Map<string, { session: StoredSession; user: StoredUser | undefined }>()
  syncStates = new Map<string, StoredSyncState>()

  async findUserByNormalizedUsername(normalizedUsername: string) {
    return this.usersByName.get(normalizedUsername) ?? null
  }

  async createUser(user: StoredUser) {
    if (this.usersByName.has(user.normalizedUsername)) {
      const error = new Error('Duplicate username') as Error & { code?: string }
      error.code = 'DUPLICATE_USERNAME'
      throw error
    }
    this.users.set(user.id, user)
    this.usersByName.set(user.normalizedUsername, user)
  }

  async createSession(session: StoredSession) {
    this.sessions.set(session.tokenHash, {
      session,
      user: this.users.get(session.userId),
    })
  }

  async getSessionByTokenHash(tokenHash: string) {
    return this.sessions.get(tokenHash) ?? null
  }

  async deleteSessionByTokenHash(tokenHash: string) {
    this.sessions.delete(tokenHash)
  }

  async touchSession(sessionId: string, lastSeenAt: Date) {
    for (const entry of this.sessions.values()) {
      if (entry.session.id === sessionId) {
        entry.session.lastSeenAt = lastSeenAt
      }
    }
  }

  async getSyncState(userId: string) {
    return this.syncStates.get(userId) ?? null
  }

  async upsertSyncState(state: StoredSyncState) {
    this.syncStates.set(state.userId, state)
  }
}

const extractSessionToken = (cookie: string | undefined): string => {
  if (!cookie) return ''
  return decodeURIComponent(cookie.split(';')[0]?.split('=')[1] ?? '')
}

describe('createSyncService', () => {
  it('registers a user and returns a session cookie', async () => {
    const repo = new InMemorySyncRepository()
    const service = createSyncService({
      repo,
      sessionSecret: 'test-secret',
      sessionCookieName: 'sync_cookie',
      now: () => new Date('2026-04-27T00:00:00.000Z'),
    })

    const response = await service.register(
      {
        username: 'UserOne',
        password: 'password123',
      },
      false,
    )

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      session: expect.objectContaining({
        user: {
          id: expect.any(String),
          username: 'userone',
        },
      }),
    })
    expect(response.setCookie).toContain('sync_cookie=')
  })

  it('merges stale state updates on revision conflict', async () => {
    const repo = new InMemorySyncRepository()
    const service = createSyncService({
      repo,
      sessionSecret: 'test-secret',
      sessionCookieName: 'sync_cookie',
      now: () => new Date('2026-04-27T00:00:00.000Z'),
    })

    const registerResponse = await service.register(
      {
        username: 'UserTwo',
        password: 'password123',
      },
      false,
    )
    const sessionToken = extractSessionToken(registerResponse.setCookie)

    const firstSnapshot = createEmptySyncSnapshot(1)
    firstSnapshot.favorites.push({
      id: 'fav-a',
      sourceType: 'tmdb',
      addedAt: 1,
      updatedAt: 1,
        watchStatus: FavoriteWatchStatus.NOT_WATCHED,
      tags: [],
      media: {
        id: 1,
        mediaType: 'movie',
        title: 'A',
        originalTitle: 'A',
        posterPath: null,
        backdropPath: null,
        releaseDate: '2024-01-01',
        voteAverage: 7,
      },
    })

    const secondSnapshot = createEmptySyncSnapshot(2)
    secondSnapshot.favorites.push({
      id: 'fav-b',
      sourceType: 'tmdb',
      addedAt: 2,
      updatedAt: 2,
        watchStatus: FavoriteWatchStatus.WATCHING,
      tags: [],
      media: {
        id: 2,
        mediaType: 'movie',
        title: 'B',
        originalTitle: 'B',
        posterPath: null,
        backdropPath: null,
        releaseDate: '2024-01-02',
        voteAverage: 8,
      },
    })

    const firstUpdate = await service.updateState(sessionToken, {
      revision: 0,
      snapshot: firstSnapshot,
    })
    const conflictUpdate = await service.updateState(sessionToken, {
      revision: 0,
      snapshot: secondSnapshot,
    })

    expect(firstUpdate.status).toBe(200)
    expect(conflictUpdate.status).toBe(200)
    expect(conflictUpdate.body).toEqual(
      expect.objectContaining({
        merged: true,
        revision: 2,
      }),
    )
    expect(
      (conflictUpdate.body as {
        snapshot: SyncSnapshot
      }).snapshot.favorites,
    ).toHaveLength(2)
  })
})
