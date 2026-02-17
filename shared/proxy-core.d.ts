export interface ProxyErrorCause {
  name?: string
  code?: string
  message?: string
}

export interface ParsedProxyError {
  message: string
  cause?: ProxyErrorCause
}

export function getProxyTimeoutMs(rawTimeout?: string | number | null | undefined): number
export function parseProxyError(error: unknown): ParsedProxyError
export function handleProxyRequest(targetUrl: string): Promise<Response>
export function getTargetUrl(url: string): string
