import { Pool } from 'pg'

export const SYNC_MIGRATIONS = [
  `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      username_normalized TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS user_sync_state (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      state JSONB NOT NULL,
      revision INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `,
  'CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);',
]

const pools = new Map()

function createPool(connectionString) {
  if (pools.has(connectionString)) {
    return pools.get(connectionString)
  }

  const pool = new Pool({ connectionString })
  pools.set(connectionString, pool)
  return pool
}

function mapUser(row) {
  return {
    id: row.id,
    username: row.username,
    normalizedUsername: row.username_normalized,
    passwordHash: row.password_hash,
    createdAt: new Date(row.created_at),
  }
}

function mapSessionWithUser(row) {
  return {
    user: {
      id: row.user_id,
      username: row.username,
      normalizedUsername: row.username_normalized,
      passwordHash: row.password_hash,
      createdAt: new Date(row.user_created_at),
    },
    session: {
      id: row.session_id,
      userId: row.user_id,
      tokenHash: row.token_hash,
      expiresAt: new Date(row.expires_at),
      createdAt: new Date(row.session_created_at),
      lastSeenAt: new Date(row.last_seen_at),
    },
  }
}

function mapSyncState(row) {
  return {
    userId: row.user_id,
    snapshot: row.state,
    revision: row.revision,
    updatedAt: new Date(row.updated_at),
  }
}

export function createPostgresSyncRepository({ connectionString }) {
  const pool = createPool(connectionString)

  return {
    async findUserByNormalizedUsername(normalizedUsername) {
      const result = await pool.query(
        `
          SELECT id, username, username_normalized, password_hash, created_at
          FROM users
          WHERE username_normalized = $1
          LIMIT 1
        `,
        [normalizedUsername],
      )

      return result.rows[0] ? mapUser(result.rows[0]) : null
    },

    async createUser(user) {
      try {
        await pool.query(
          `
            INSERT INTO users (id, username, username_normalized, password_hash, created_at)
            VALUES ($1, $2, $3, $4, $5)
          `,
          [user.id, user.username, user.normalizedUsername, user.passwordHash, user.createdAt],
        )
      } catch (error) {
        if (error instanceof Error && error.code === '23505') {
          const conflictError = new Error('Duplicate username')
          conflictError.code = 'DUPLICATE_USERNAME'
          throw conflictError
        }
        throw error
      }
    },

    async createSession(session) {
      await pool.query(
        `
          INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at, last_seen_at)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          session.id,
          session.userId,
          session.tokenHash,
          session.expiresAt,
          session.createdAt,
          session.lastSeenAt,
        ],
      )
    },

    async getSessionByTokenHash(tokenHash) {
      const result = await pool.query(
        `
          SELECT
            s.id AS session_id,
            s.user_id,
            s.token_hash,
            s.expires_at,
            s.created_at AS session_created_at,
            s.last_seen_at,
            u.username,
            u.username_normalized,
            u.password_hash,
            u.created_at AS user_created_at
          FROM sessions s
          INNER JOIN users u ON u.id = s.user_id
          WHERE s.token_hash = $1
          LIMIT 1
        `,
        [tokenHash],
      )

      return result.rows[0] ? mapSessionWithUser(result.rows[0]) : null
    },

    async deleteSessionByTokenHash(tokenHash) {
      await pool.query('DELETE FROM sessions WHERE token_hash = $1', [tokenHash])
    },

    async touchSession(sessionId, lastSeenAt) {
      await pool.query('UPDATE sessions SET last_seen_at = $2 WHERE id = $1', [sessionId, lastSeenAt])
    },

    async getSyncState(userId) {
      const result = await pool.query(
        `
          SELECT user_id, state, revision, updated_at
          FROM user_sync_state
          WHERE user_id = $1
          LIMIT 1
        `,
        [userId],
      )

      return result.rows[0] ? mapSyncState(result.rows[0]) : null
    },

    async upsertSyncState({ userId, snapshot, revision, updatedAt }) {
      await pool.query(
        `
          INSERT INTO user_sync_state (user_id, state, revision, updated_at)
          VALUES ($1, $2::jsonb, $3, $4)
          ON CONFLICT (user_id)
          DO UPDATE SET
            state = EXCLUDED.state,
            revision = EXCLUDED.revision,
            updated_at = EXCLUDED.updated_at
        `,
        [userId, JSON.stringify(snapshot), revision, updatedAt],
      )
    },
  }
}
