// Cloudflare Pages Function
// 部署到 Cloudflare Pages 时，此文件会自动处理 /proxy 路由
// 注意：Cloudflare Workers 环境不支持直接导入 src 模块，需要内联核心逻辑

interface Context {
  request: Request
  env: unknown
  params: unknown
}

const DEFAULT_PROXY_TIMEOUT_MS = 15000
const MIN_PROXY_TIMEOUT_MS = 1000
const MAX_PROXY_TIMEOUT_MS = 120000

function getProxyTimeoutMs(env: unknown): number {
  const envObj = env && typeof env === 'object' ? (env as Record<string, unknown>) : {}
  const rawTimeout = envObj.PROXY_TIMEOUT_MS
  const parsed = Number(rawTimeout)

  if (!Number.isFinite(parsed)) {
    return DEFAULT_PROXY_TIMEOUT_MS
  }
  return Math.min(MAX_PROXY_TIMEOUT_MS, Math.max(MIN_PROXY_TIMEOUT_MS, Math.floor(parsed)))
}

function parseProxyError(error: unknown): {
  message: string
  cause?: { name?: string; code?: string; message?: string }
} {
  const typedError = error as Error & { cause?: unknown }
  const payload: {
    message: string
    cause?: { name?: string; code?: string; message?: string }
  } = {
    message: typedError instanceof Error ? typedError.message : 'Unknown error',
  }

  if (!(typedError instanceof Error) || !typedError.cause || typeof typedError.cause !== 'object') {
    return payload
  }

  const cause = typedError.cause as { name?: unknown; code?: unknown; message?: unknown }
  const parsedCause: { name?: string; code?: string; message?: string } = {}

  if (typeof cause.name === 'string') {
    parsedCause.name = cause.name
  }
  if (typeof cause.code === 'string' || typeof cause.code === 'number') {
    parsedCause.code = String(cause.code)
  }
  if (typeof cause.message === 'string') {
    parsedCause.message = cause.message
  }

  if (Object.keys(parsedCause).length > 0) {
    payload.cause = parsedCause
  }
  return payload
}

// 内联核心代理逻辑（Cloudflare Workers 环境限制）
async function handleProxyRequest(targetUrl: string, timeoutMs: number): Promise<Response> {
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
    signal: AbortSignal.timeout(timeoutMs),
  })

  return response
}

export const onRequest = async (context: Context) => {
  const url = new URL(context.request.url)
  const targetUrl = url.searchParams.get('url')

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'URL parameter is required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  }

  try {
    const timeoutMs = getProxyTimeoutMs(context.env)
    const response = await handleProxyRequest(targetUrl, timeoutMs)

    // Create a new response with the body from the fetch
    const newResponse = new Response(response.body, response)

    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newResponse.headers.set(key, value)
    })

    return newResponse
  } catch (error) {
    const timeoutMs = getProxyTimeoutMs(context.env)
    const { message, cause } = parseProxyError(error)
    return new Response(JSON.stringify({ error: 'Proxy request failed', message, cause, timeoutMs }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  }
}
