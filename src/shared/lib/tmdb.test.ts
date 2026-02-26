import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSettingStore } from '@/shared/store/settingStore'
import {
  DEFAULT_TMDB_API_BASE_URL,
  DEFAULT_TMDB_IMAGE_BASE_URL,
  getTmdbClient,
  resolveTmdbApiBaseUrl,
  resolveTmdbImageBaseUrl,
} from './tmdb'

const ORIGINAL_ENV_API_BASE = import.meta.env.OKI_TMDB_API_BASE_URL
const ORIGINAL_ENV_IMAGE_BASE = import.meta.env.OKI_TMDB_IMAGE_BASE_URL
const ORIGINAL_FETCH = globalThis.fetch
const ORIGINAL_SYSTEM = structuredClone(useSettingStore.getState().system)

function setSystemSettingsForTest(
  settings: Partial<ReturnType<typeof useSettingStore.getState>['system']>,
) {
  useSettingStore.getState().setSystemSettings(settings)
}

describe('tmdb base url 解析策略', () => {
  beforeEach(() => {
    useSettingStore.setState(state => ({
      ...state,
      system: { ...ORIGINAL_SYSTEM },
    }))
    import.meta.env.OKI_TMDB_API_BASE_URL = ORIGINAL_ENV_API_BASE
    import.meta.env.OKI_TMDB_IMAGE_BASE_URL = ORIGINAL_ENV_IMAGE_BASE
  })

  afterEach(() => {
    globalThis.fetch = ORIGINAL_FETCH
  })

  it('设置值优先于环境变量', () => {
    import.meta.env.OKI_TMDB_API_BASE_URL = '/tmdb-env-api'
    import.meta.env.OKI_TMDB_IMAGE_BASE_URL = '/tmdb-env-image'
    setSystemSettingsForTest({
      tmdbApiBaseUrl: '/tmdb-setting-api',
      tmdbImageBaseUrl: '/tmdb-setting-image',
    })

    expect(resolveTmdbApiBaseUrl()).toBe('/tmdb-setting-api/3')
    expect(resolveTmdbImageBaseUrl()).toBe('/tmdb-setting-image/t/p/')
  })

  it('设置值为空时回退环境变量', () => {
    import.meta.env.OKI_TMDB_API_BASE_URL = 'https://example.com/tmdb'
    import.meta.env.OKI_TMDB_IMAGE_BASE_URL = 'https://example.com/tmdb-images'
    setSystemSettingsForTest({
      tmdbApiBaseUrl: '',
      tmdbImageBaseUrl: '   ',
    })

    expect(resolveTmdbApiBaseUrl()).toBe('https://example.com/tmdb/3')
    expect(resolveTmdbImageBaseUrl()).toBe('https://example.com/tmdb-images/t/p/')
  })

  it('环境变量为空时回退官方默认地址', () => {
    import.meta.env.OKI_TMDB_API_BASE_URL = ''
    import.meta.env.OKI_TMDB_IMAGE_BASE_URL = ''
    setSystemSettingsForTest({
      tmdbApiBaseUrl: '',
      tmdbImageBaseUrl: '',
    })

    expect(resolveTmdbApiBaseUrl()).toBe(DEFAULT_TMDB_API_BASE_URL)
    expect(resolveTmdbImageBaseUrl()).toBe(DEFAULT_TMDB_IMAGE_BASE_URL)
  })

  it('API 与图片地址会自动补齐标准后缀', () => {
    setSystemSettingsForTest({
      tmdbApiBaseUrl: '/custom-api',
      tmdbImageBaseUrl: '/custom-image',
    })

    expect(resolveTmdbApiBaseUrl()).toBe('/custom-api/3')
    expect(resolveTmdbImageBaseUrl()).toBe('/custom-image/t/p/')
  })

  it('非法地址会回退到下一优先级', () => {
    import.meta.env.OKI_TMDB_API_BASE_URL = '/env-api'
    import.meta.env.OKI_TMDB_IMAGE_BASE_URL = '/env-image'
    setSystemSettingsForTest({
      tmdbApiBaseUrl: 'ftp://invalid-host',
      tmdbImageBaseUrl: 'javascript:alert(1)',
    })

    expect(resolveTmdbApiBaseUrl()).toBe('/env-api/3')
    expect(resolveTmdbImageBaseUrl()).toBe('/env-image/t/p/')
  })
})

describe('tmdb 请求改写', () => {
  beforeEach(() => {
    useSettingStore.setState(state => ({
      ...state,
      system: { ...ORIGINAL_SYSTEM },
    }))
    import.meta.env.OKI_TMDB_API_BASE_URL = ORIGINAL_ENV_API_BASE
    import.meta.env.OKI_TMDB_IMAGE_BASE_URL = ORIGINAL_ENV_IMAGE_BASE
  })

  afterEach(() => {
    globalThis.fetch = ORIGINAL_FETCH
  })

  it('search.multi 会命中自定义 API Base URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ page: 1, total_pages: 0, total_results: 0, results: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    globalThis.fetch = fetchMock as typeof fetch

    setSystemSettingsForTest({
      tmdbApiToken: 'tmdb-test-token',
      tmdbApiBaseUrl: 'https://mirror.example.com/tmdb',
    })

    const client = getTmdbClient()
    await client.search.multi({ query: 'hello' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [requestUrl, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(requestUrl).toContain('https://mirror.example.com/tmdb/3/search/multi')
    expect(requestUrl).toContain('query=hello')
    expect(requestInit.headers).toMatchObject({
      Authorization: 'Bearer tmdb-test-token',
    })
  })
})
