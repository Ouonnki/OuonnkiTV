import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleSyncRegister } from '../../../shared/sync/routes.js'
import { handleOptions, normalizeBody, requireMethod, sendSyncResponse } from '../_shared'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return
  if (!requireMethod(req, res, 'POST')) return

  const response = await handleSyncRegister({
    body: normalizeBody(req.body),
    headers: req.headers,
  })

  return sendSyncResponse(res, response)
}
