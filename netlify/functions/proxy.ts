import type { Handler, HandlerEvent } from '@netlify/functions'
import { handleProxyRequest } from '../../src/utils/proxy'

const handler: Handler = async (event: HandlerEvent) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  const { url } = event.queryStringParameters || {}

  if (!url) {
    return {
      statusCode: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'URL parameter is required' }),
    }
  }

  try {
    const response = await handleProxyRequest(url)
    const text = await response.text()
    const contentType = response.headers.get('content-type') || 'application/json'

    return {
      statusCode: response.status,
      headers: {
        ...headers,
        'Content-Type': contentType,
      },
      body: text,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Proxy request failed', message }),
    }
  }
}

export { handler }
