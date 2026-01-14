// 统一的代理处理逻辑
export async function handleProxyRequest(targetUrl: string): Promise<Response> {
  // 验证 URL
  try {
    new URL(targetUrl)
  } catch {
    throw new Error('Invalid URL format')
  }

  // 发起请求
  const response = await fetch(targetUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'application/json, text/plain, */*',
    },
    signal: AbortSignal.timeout(15000), // 15秒超时
  })

  return response
}

// 从查询参数获取目标 URL
export function getTargetUrl(url: string): string {
  const urlObj = new URL(url, 'http://localhost')
  const targetUrl = urlObj.searchParams.get('url')

  if (!targetUrl) {
    throw new Error('URL parameter is required')
  }

  return decodeURIComponent(targetUrl)
}
