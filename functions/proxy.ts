// Cloudflare Pages Function
// 部署到 Cloudflare Pages 时，此文件会自动处理 /proxy 路由
// 注意：Cloudflare Workers 环境不支持直接导入 src 模块，需要内联核心逻辑

interface Context {
  request: Request
  env: unknown
  params: unknown
}

// 内联核心代理逻辑（Cloudflare Workers 环境限制）
async function handleProxyRequest(targetUrl: string): Promise<Response> {
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
    const response = await handleProxyRequest(targetUrl)

    // Create a new response with the body from the fetch
    const newResponse = new Response(response.body, response)

    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newResponse.headers.set(key, value)
    })

    return newResponse
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: 'Proxy request failed', message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  }
}
