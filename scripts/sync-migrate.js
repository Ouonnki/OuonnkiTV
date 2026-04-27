import { Pool } from 'pg'
import { SYNC_MIGRATIONS } from '../shared/sync/postgres-repository.js'

const connectionString = process.env.SYNC_DATABASE_URL

if (!connectionString) {
  throw new Error('Missing required environment variable: SYNC_DATABASE_URL')
}

const pool = new Pool({ connectionString })

try {
  for (const statement of SYNC_MIGRATIONS) {
    await pool.query(statement)
  }
  console.log('Sync database migrations applied successfully.')
} finally {
  await pool.end()
}
