import { act, createElement as h } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import FavoritesView from '@/features/favorites/views/FavoritesView'
import HistoryView from '@/features/history/views/HistoryView'
import { useFavoritesStore } from '@/features/favorites/store/favoritesStore'
import { FavoriteWatchStatus, type FavoriteItem } from '@/features/favorites/types/favorites'
import { useViewingHistoryStore } from '@/shared/store/viewingHistoryStore'

vi.mock('@/shared/hooks/useTmdbMode', () => ({ useTmdbEnabled: () => false }))

const favorite: FavoriteItem = {
  id: 'selection-test',
  sourceType: 'cms',
  watchStatus: FavoriteWatchStatus.NOT_WATCHED,
  addedAt: 1,
  updatedAt: 1,
  tags: [],
  media: { vodId: '1', vodName: '测试影片', sourceCode: 'test', sourceName: '测试源' },
}

let container: HTMLDivElement, root: Root
let favoritesBefore: ReturnType<typeof useFavoritesStore.getState>
let historyBefore: ReturnType<typeof useViewingHistoryStore.getState>

function button(text: string, parent: ParentNode = document) {
  const found = [...parent.querySelectorAll('button')].find(
    button => button.textContent?.trim() === text,
  )
  expect(found, `Expected ${text}`).toBeDefined()
  return found!
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    },
  )
  favoritesBefore = useFavoritesStore.getState()
  historyBefore = useViewingHistoryStore.getState()
  useFavoritesStore.setState({
    favorites: [favorite],
    filteredFavorites: [favorite],
    selectedIds: new Set(),
  })
  useViewingHistoryStore.setState({
    viewingHistory: [
      {
        recordType: 'cms',
        title: '测试影片',
        imageUrl: '/history-test.jpg',
        episodeIndex: 0,
        episodeName: '第1集',
        sourceCode: 'test',
        sourceName: '测试源',
        vodId: '1',
        timestamp: Date.now(),
        playbackPosition: 10,
        duration: 100,
      },
    ],
  })
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  useFavoritesStore.setState(favoritesBefore)
  useViewingHistoryStore.setState(historyBefore)
  vi.unstubAllGlobals()
})

describe.each([
  {
    name: 'favorites',
    Page: FavoritesView,
    count: () => useFavoritesStore.getState().favorites.length,
  },
  {
    name: 'history',
    Page: HistoryView,
    count: () => useViewingHistoryStore.getState().viewingHistory.length,
  },
])('$name selection workflow', ({ Page, count }) => {
  beforeEach(() => {
    act(() =>
      root.render(h(MemoryRouter, null, h('main', { 'data-slot': 'sidebar-inset' }, h(Page)))),
    )
  })

  it('uses the header to enter and exit the same batch toolbar', () => {
    expect(container.querySelector('aside[aria-label="批量操作"]')).toBeNull()
    const header = container.querySelector('header')!
    act(() => button('编辑', header).click())
    const toolbar = container.querySelector('aside[aria-label="批量操作"]')!
    expect(toolbar).not.toBeNull()
    expect(container.querySelector('.pb-44')).not.toBeNull()
    act(() => button('全选', toolbar).click())
    expect(toolbar.querySelector('[role="status"]')?.textContent).toContain('1/1')
    act(() => button('完成', header).click())
    expect(button('编辑', header)).toBeDefined()
    expect(container.querySelector('.pb-44')).toBeNull()
    expect(count()).toBe(1)
  })

  it('only deletes selected records after confirmation and exits editing', async () => {
    act(() => button('编辑', container.querySelector('header')!).click())
    const toolbar = container.querySelector('aside[aria-label="批量操作"]')!
    act(() => button('全选', toolbar).click())
    act(() => button('删除', toolbar).click())
    expect(count()).toBe(1)
    const confirmation = document.querySelector('[role="alertdialog"]')!
    expect(confirmation).not.toBeNull()
    act(() => button('取消', confirmation).click())
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    expect(document.activeElement).toBe(button('删除', toolbar))
    expect(count()).toBe(1)
    act(() => button('删除', toolbar).click())
    act(() => button('确认删除', document.querySelector('[role="alertdialog"]')!).click())
    expect(count()).toBe(0)
    expect(button('编辑', container.querySelector('header')!).disabled).toBe(true)
  })

  it('keeps unselected records when deleting a subset', () => {
    const second: FavoriteItem = {
      ...favorite,
      id: 'selection-second',
      media: { ...favorite.media, vodId: '2', vodName: '保留的影片' },
    }
    act(() => {
      useFavoritesStore.setState({
        favorites: [favorite, second],
        filteredFavorites: [favorite, second],
      })
      const first = useViewingHistoryStore.getState().viewingHistory[0]
      useViewingHistoryStore.setState({
        viewingHistory: [
          first,
          { ...first, vodId: '2', title: '保留的影片', timestamp: first.timestamp - 1 },
        ],
      })
    })
    act(() => button('编辑', container.querySelector('header')!).click())
    act(() => container.querySelector<HTMLButtonElement>('[role="checkbox"]')!.click())
    const toolbar = container.querySelector('aside')!
    expect(toolbar.querySelector('[role="status"]')?.textContent).toContain('1/2')
    act(() => button('删除', toolbar).click())
    act(() => button('确认删除', document.querySelector('[role="alertdialog"]')!).click())
    expect(count()).toBe(1)
    expect(container.textContent).toContain('保留的影片')
  })

  it('requires confirmation before clearing the visible list', () => {
    act(() => button('编辑', container.querySelector('header')!).click())
    const toolbar = container.querySelector('aside')!
    act(() => button('清空', toolbar).click())
    expect(count()).toBe(1)
    act(() => button('取消', document.querySelector('[role="alertdialog"]')!).click())
    expect(count()).toBe(1)
    act(() => button('清空', toolbar).click())
    act(() => button('确认清空', document.querySelector('[role="alertdialog"]')!).click())
    expect(count()).toBe(0)
  })
})

it('clears favorites selection when changing the visible category', () => {
  act(() =>
    root.render(
      h(MemoryRouter, null, h('main', { 'data-slot': 'sidebar-inset' }, h(FavoritesView))),
    ),
  )
  act(() => button('编辑', container.querySelector('header')!).click())
  act(() => button('全选', container.querySelector('aside')!).click())
  expect(useFavoritesStore.getState().selectedIds.size).toBe(1)
  act(() => button('已看完', container.querySelector('header')!).click())
  expect(useFavoritesStore.getState().selectedIds.size).toBe(0)
  expect(useFavoritesStore.getState().favorites).toHaveLength(1)
})
