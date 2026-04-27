import type { VercelRequest, VercelResponse } from '@vercel/node'

type SyncHandlerResponse = {
  status: number
  body: unknown
  setCookie?: string
}

export const sendSyncResponse = (
  res: VercelResponse,
  response: SyncHandlerResponse,
): VercelResponse => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'no-store')

  if (response.setCookie) {
    res.setHeader('Set-Cookie', response.setCookie)
  }

  return res.status(response.status).json(response.body)
}

export const handleOptions = (req: VercelRequest, res: VercelResponse): boolean => {
  if (req.method !== 'OPTIONS') return false

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.status(200).end()
  return true
}

export const requireMethod = (
  req: VercelRequest,
  res: VercelResponse,
  method: 'GET' | 'POST' | 'PUT',
): boolean => {
  if (req.method === method) return true
  sendSyncResponse(res, {
    status: 405,
    body: {
      error: `Method ${req.method} Not Allowed`,
    },
  })
  return false
}

export const normalizeBody = (body: unknown): unknown => {
  if (typeof body !== 'string') return body

  try {
    return JSON.parse(body)
  } catch {
    return {}
  }
}
