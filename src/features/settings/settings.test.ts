import { act, createElement as h } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import SettingsLayout from '@/app/layouts/SettingsLayout'
import PlaybackSettings from './components/PlaybackSettings'
import SystemSettings from './views/SystemSettings'
import PersonalConfig from './components/PersonalConfig'
import VideoSourceCard from './components/VideoSource/VideoSourceCard'
import VideoSourceSettings from './components/VideoSource'
import SubscriptionSourceDetail from './components/VideoSource/SubscriptionSourceDetail'
import { useSettingStore } from '@/shared/store/settingStore'
import { useApiStore } from '@/shared/store/apiStore'
import {
  SettingsInput,
  SettingsItem,
  SettingsSelectTrigger,
  SettingsSwitch,
} from './components/common'
import { Select, SelectValue } from '@/shared/components/ui/select'

const actions = vi.hoisted(() => ({
  changeMode: vi.fn(),
  exportConfig: vi.fn(),
  exportConfigToText: vi.fn(),
  importConfig: vi.fn(),
  restoreDefault: vi.fn(),
}))

vi.mock('@/shared/components/theme', () => ({
  useTheme: () => ({ mode: 'system', changeMode: actions.changeMode }),
}))
vi.mock('@/shared/hooks/useTmdbMode', () => ({ useTmdbEnabled: () => false }))
vi.mock('@/shared/hooks/usePersonalConfig', () => ({
  usePersonalConfig: () => actions,
}))

let container: HTMLDivElement
let root: Root

function render(element: React.ReactNode) {
  act(() => root.render(element))
}

function findButton(text: string) {
  const button = [...container.querySelectorAll('button')].find(item =>
    item.textContent?.includes(text),
  )
  expect(button, `Expected button: ${text}`).toBeDefined()
  return button!
}

function findLabelledControl(title: string) {
  const label = [...container.querySelectorAll('label')].find(item => item.textContent === title)
  expect(label, `Expected label: ${title}`).toBeDefined()
  const control = document.getElementById(label!.htmlFor)
  expect(control, `Expected control for: ${title}`).not.toBeNull()
  return control!
}

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    },
  )
  vi.clearAllMocks()
  useSettingStore.getState().resetSettings()
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.unstubAllGlobals()
})

describe('settings form scaffold', () => {
  it('connects nested controls to unique labels and descriptions', () => {
    render(
      h(
        'div',
        null,
        h(SettingsItem, {
          title: '请求地址',
          description: '地址说明',
          control: h('div', null, h(SettingsInput, { value: '/proxy', readOnly: true })),
        }),
        h(SettingsItem, {
          title: '开启代理',
          description: '开关说明',
          control: h(SettingsSwitch, { checked: true }),
        }),
        h(SettingsItem, {
          title: '剧集顺序',
          control: h(Select, { value: 'asc' }, h(SettingsSelectTrigger, null, h(SelectValue))),
        }),
      ),
    )

    const input = findLabelledControl('请求地址')
    const toggle = findLabelledControl('开启代理')
    const select = findLabelledControl('剧集顺序')
    expect(new Set([input.id, toggle.id, select.id]).size).toBe(3)
    expect(document.getElementById(input.getAttribute('aria-describedby')!)?.textContent).toBe(
      '地址说明',
    )
    expect(document.getElementById(toggle.getAttribute('aria-describedby')!)?.textContent).toBe(
      '开关说明',
    )
    expect(select.getAttribute('role')).toBe('combobox')
  })
})

describe('settings routes', () => {
  it('keeps all five categories reachable and updates the active route', () => {
    render(
      h(
        MemoryRouter,
        { initialEntries: ['/settings/playback'] },
        h(
          Routes,
          null,
          h(
            Route,
            { path: '/settings', element: h(SettingsLayout) },
            ...['source', 'playback', 'system', 'profile', 'about'].map(path =>
              h(Route, { key: path, path, element: h('p', null, `page:${path}`) }),
            ),
          ),
        ),
      ),
    )
    const nav = container.querySelector('nav[aria-label="设置分类"]')!
    expect(nav.querySelectorAll('a')).toHaveLength(5)
    expect(nav.querySelector('[aria-current="page"]')?.textContent).toBe('播放')
    act(() => (nav.querySelector('[href="/settings/profile"]') as HTMLAnchorElement).click())
    expect(nav.querySelector('[aria-current="page"]')?.textContent).toBe('个人配置')
    expect(container.textContent).toContain('page:profile')
    expect(document.title).toContain('个人配置 - 设置')
    expect(container.textContent).not.toContain('模块导览')
  })
})

describe('settings interactions', () => {
  it('persists playback switches and allows toggling through their visible label', () => {
    render(h(PlaybackSettings))
    const toggle = findLabelledControl('自动续播下一集')
    const previous = useSettingStore.getState().playback.isAutoPlayEnabled
    const label = container.querySelector(`label[for="${toggle.id}"]`)!
    act(() => (label as HTMLLabelElement).click())
    expect(useSettingStore.getState().playback.isAutoPlayEnabled).toBe(!previous)
    expect(toggle.getAttribute('aria-checked')).toBe(String(!previous))
    const persisted = JSON.parse(localStorage.getItem('ouonnki-tv-setting-store') ?? 'null')
    expect(persisted?.state.playback.isAutoPlayEnabled).toBe(!previous)
  })

  it('provides labels for every playback input, switch, and select', () => {
    render(h(PlaybackSettings))
    const controls = container.querySelectorAll(
      'input:not([type="hidden"]), [role="switch"], [role="combobox"]',
    )
    expect(controls.length).toBeGreaterThan(10)
    for (const control of controls) {
      expect(control.id).toBeTruthy()
      expect(
        [...container.querySelectorAll('label')].some(label => label.htmlFor === control.id),
      ).toBe(true)
    }
  })

  it('groups theme, search, network and TMDB settings and keeps theme selection keyboard-native', () => {
    render(h(SystemSettings))
    const headings = [...container.querySelectorAll('h3')].map(node => node.textContent)
    expect(headings).toEqual(['界面外观', '搜索设置', '网络设置', '系统行为', 'TMDB 智能服务'])
    const radios = container.querySelectorAll<HTMLInputElement>('input[type="radio"]')
    expect(radios).toHaveLength(3)
    expect(radios[2].checked).toBe(true)
    act(() => radios[1].click())
    expect(actions.changeMode).toHaveBeenCalledWith('dark')
    expect(findLabelledControl('代理地址').tagName).toBe('INPUT')
    expect(findLabelledControl('默认重试次数').getAttribute('min')).toBe('0')
  })

  it('exposes exports directly and confirms destructive resets before applying them', () => {
    render(h(PersonalConfig))
    act(() => findButton('下载文件').click())
    act(() => findButton('复制文本').click())
    expect(actions.exportConfig).toHaveBeenCalledOnce()
    expect(actions.exportConfigToText).toHaveBeenCalledOnce()
    act(() => findButton('恢复默认配置').click())
    expect(actions.restoreDefault).not.toHaveBeenCalled()
    const dialog = document.querySelector('[role="dialog"]')!
    expect(dialog.textContent).toContain('建议先导出备份')
    const cancel = [...dialog.querySelectorAll('button')].find(
      button => button.textContent === '取消',
    )!
    act(() => cancel.click())
    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(actions.restoreDefault).not.toHaveBeenCalled()
  })

  it('labels per-source controls and updates source enabled state', () => {
    const source = {
      id: 'settings-test-source',
      name: '测试源',
      url: 'https://example.com/api',
      isEnabled: true,
    }
    const previousSources = useApiStore.getState().videoAPIs
    const onEdit = vi.fn()
    useApiStore.setState({ videoAPIs: [source] })
    try {
      render(h(VideoSourceCard, { source, onEdit }))
      const toggle = container.querySelector<HTMLButtonElement>(
        '[role="switch"][aria-label="启用 测试源"]',
      )!
      expect(toggle).not.toBeNull()
      act(() => toggle.click())
      expect(useApiStore.getState().videoAPIs[0].isEnabled).toBe(false)
      act(() => container.querySelector<HTMLButtonElement>('[aria-label="编辑 测试源"]')!.click())
      expect(onEdit).toHaveBeenCalledOnce()
      expect(container.textContent).toContain(source.url)
    } finally {
      act(() => useApiStore.setState({ videoAPIs: previousSources }))
    }
  })

  it('uses a zero default retry count when adding a source', () => {
    const previousSources = useApiStore.getState().videoAPIs
    useApiStore.setState({ videoAPIs: [] })
    useSettingStore.getState().setNetworkSettings({ defaultRetry: 0 })
    try {
      render(h(VideoSourceSettings))
      act(() => findButton('添加视频源').click())
      expect((document.getElementById('retry') as HTMLInputElement).value).toBe('0')
      expect(document.querySelector('[role="dialog"]')?.textContent).toContain('添加视频源')
    } finally {
      act(() => useApiStore.setState({ videoAPIs: previousSources }))
    }
  })

  it('keeps the subscription detail switch in sync with live source state', () => {
    const source = {
      id: 'settings-detail-source',
      name: '订阅测试源',
      url: 'https://example.com/api',
      isEnabled: true,
    }
    const previousSources = useApiStore.getState().videoAPIs
    useApiStore.setState({ videoAPIs: [source] })
    try {
      render(h(SubscriptionSourceDetail, { source }))
      const toggle = container.querySelector<HTMLButtonElement>('[role="switch"]')!
      act(() => toggle.click())
      expect(toggle.getAttribute('aria-checked')).toBe('false')
      expect(useApiStore.getState().videoAPIs[0].isEnabled).toBe(false)
      act(() => toggle.click())
      expect(toggle.getAttribute('aria-checked')).toBe('true')
    } finally {
      act(() => useApiStore.setState({ videoAPIs: previousSources }))
    }
  })
})
