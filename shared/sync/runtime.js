import { getSyncCookieName } from './cookies.js'
import { createPostgresSyncRepository } from './postgres-repository.js'
import { createSyncService } from './service.js'

let runtime = null

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required sync environment variable: ${name}`)
  }
  return value
}

export function getSyncRuntime() {
  if (runtime) {
    return runtime
  }

  const databaseUrl = requireEnv('SYNC_DATABASE_URL')
  const sessionSecret = requireEnv('SYNC_SESSION_SECRET')
  const repo = createPostgresSyncRepository({ connectionString: databaseUrl })
  const service = createSyncService({
    repo,
    sessionSecret,
    sessionCookieName: getSyncCookieName(),
  })

  runtime = {
    service,
    sessionCookieName: getSyncCookieName(),
  }

  return runtime
}
