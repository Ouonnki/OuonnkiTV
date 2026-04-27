import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleSyncSession } from '../../shared/sync/routes.js'
import { handleOptions, requireMethod, sendSyncResponse } from './_shared'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return
  if (!requireMethod(req, res, 'GET')) return

  const response = await handleSyncSession({
    headers: req.headers,
  })

  return sendSyncResponse(res, response)
}
