import type { Plugin } from 'vite'
import {
  handleProxyRequest,
  getProxyTimeoutMs,
  getTargetUrl,
  parseProxyError,
} from '../shared/lib/proxy'

export function proxyMiddleware(): Plugin {
  return {
    name: 'proxy-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/proxy')) {
          return next()
        }

        try {
          const targetUrl = getTargetUrl(req.url)
          const response = await handleProxyRequest(targetUrl)
          const text = await response.text()
          const contentType = response.headers.get('content-type') || 'application/json'

          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Content-Type', contentType)
          res.writeHead(response.status)
          res.end(text)
        } catch (error) {
          const { message, cause } = parseProxyError(error)
          const timeoutMs = getProxyTimeoutMs()
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Proxy request failed', message, cause, timeoutMs }))
        }
      })
    },
  }
}
