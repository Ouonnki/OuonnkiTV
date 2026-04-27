import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleSyncGetState, handleSyncPutState } from '../../shared/sync/routes.js'
import { handleOptions, normalizeBody, sendSyncResponse } from './_shared'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return

  if (req.method === 'GET') {
    const response = await handleSyncGetState({
      headers: req.headers,
    })
    return sendSyncResponse(res, response)
  }

  if (req.method === 'PUT') {
    const response = await handleSyncPutState({
      body: normalizeBody(req.body),
      headers: req.headers,
    })
    return sendSyncResponse(res, response)
  }

  return sendSyncResponse(res, {
    status: 405,
    body: {
      error: `Method ${req.method} Not Allowed`,
    },
  })
}
