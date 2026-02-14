/**
 * 统一代理核心逻辑（供 Vercel/Netlify/本地中间件复用）
 * 使用 JS 文件确保 Serverless 运行时可直接解析，不依赖 TS 源文件转译。
 */
export async function handleProxyRequest(targetUrl) {
  try {
    new URL(targetUrl)
  } catch {
    throw new Error('Invalid URL format')
  }

  return fetch(targetUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'application/json, text/plain, */*',
    },
    signal: AbortSignal.timeout(15000),
  })
}

export function getTargetUrl(url) {
  const urlObj = new URL(url, 'http://localhost')
  const targetUrl = urlObj.searchParams.get('url')

  if (!targetUrl) {
    throw new Error('URL parameter is required')
  }

  return decodeURIComponent(targetUrl)
}
