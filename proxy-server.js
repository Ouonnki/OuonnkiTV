import express from 'express'
import cors from 'cors'
import { getProxyTimeoutMs, parseProxyError, handleProxyRequest } from './shared/proxy-core.js'
import {
  handleSyncGetState,
  handleSyncLogin,
  handleSyncLogout,
  handleSyncPutState,
  handleSyncRegister,
  handleSyncSession,
} from './shared/sync/routes.js'

const app = express()
const PORT = process.env.PROXY_PORT || 3001

app.use(cors({ origin: '*' }))
app.use(express.json({ limit: '1mb' }))

const sendJsonResponse = (res, response) => {
  res.setHeader('Cache-Control', 'no-store')
  if (response.setCookie) {
    res.setHeader('Set-Cookie', response.setCookie)
  }
  return res.status(response.status).json(response.body)
}

app.get('/proxy', async (req, res) => {
  try {
    const { url } = req.query
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' })
    }

    const targetUrl = decodeURIComponent(url)
    const response = await handleProxyRequest(targetUrl)
    const text = await response.text()
    const contentType = response.headers.get('content-type') || 'application/json'

    res.setHeader('Content-Type', contentType)
    res.status(response.status).send(text)
  } catch (error) {
    const { message, cause } = parseProxyError(error)
    res.status(500).json({
      error: 'Proxy request failed',
      message,
      cause,
      timeoutMs: getProxyTimeoutMs(),
    })
  }
})

app.post('/api/sync/auth/register', async (req, res) => {
  const response = await handleSyncRegister({
    body: req.body,
    headers: req.headers,
  })
  return sendJsonResponse(res, response)
})

app.post('/api/sync/auth/login', async (req, res) => {
  const response = await handleSyncLogin({
    body: req.body,
    headers: req.headers,
  })
  return sendJsonResponse(res, response)
})

app.post('/api/sync/auth/logout', async (req, res) => {
  const response = await handleSyncLogout({
    headers: req.headers,
  })
  return sendJsonResponse(res, response)
})

app.get('/api/sync/session', async (req, res) => {
  const response = await handleSyncSession({
    headers: req.headers,
  })
  return sendJsonResponse(res, response)
})

app.get('/api/sync/state', async (req, res) => {
  const response = await handleSyncGetState({
    headers: req.headers,
  })
  return sendJsonResponse(res, response)
})

app.put('/api/sync/state', async (req, res) => {
  const response = await handleSyncPutState({
    body: req.body,
    headers: req.headers,
  })
  return sendJsonResponse(res, response)
})

app.listen(PORT, () => console.log(`Proxy server on :${PORT}`))
