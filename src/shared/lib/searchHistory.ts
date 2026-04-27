const WHITESPACE_PATTERN = /\s+/g

const encodeUtf8Base64 = (value: string): string => {
  const bytes = new TextEncoder().encode(value)
  let binary = ''

  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000))
  }

  return btoa(binary)
}

export const normalizeSearchContent = (content: string): string => {
  return content.trim().replace(WHITESPACE_PATTERN, ' ')
}

export const buildSearchHistoryId = (content: string): string => {
  return `search_${encodeUtf8Base64(normalizeSearchContent(content))}`
}
