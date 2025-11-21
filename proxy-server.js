import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PROXY_PORT || 3001

// 统一的代理处理逻辑
async function handleProxyRequest(targetUrl) {
  try {
    new URL(targetUrl)
  } catch {
    throw new Error('Invalid URL format')
  }

  const response = await fetch(targetUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'application/json, text/plain, */*',
    },
    signal: AbortSignal.timeout(15000),
  })

  return response
}

app.use(cors({ origin: '*' }))

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
    res.status(500).json({
      error: 'Proxy request failed',
      message: error.message,
    })
  }
})

app.listen(PORT, () => console.log(`Proxy server on :${PORT}`))
