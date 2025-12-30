import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router'
import { Spinner } from '@/components/ui/spinner'
import AuthGuard from '@/components/AuthGuard'

// Layouts
import MainLayout from '@/layouts/MainLayout'
import PlayerLayout from '@/layouts/PlayerLayout'
import SettingsLayout from '@/layouts/SettingsLayout'

// Views (lazy loaded)
const HomeView = lazy(() => import('@/views/HomeView'))
const SearchHubView = lazy(() => import('@/views/SearchHubView'))
const FavoritesView = lazy(() => import('@/views/FavoritesView'))
const HistoryView = lazy(() => import('@/views/HistoryView'))

// Settings sub-routes
const SourceSettings = lazy(() => import('@/views/settings/SourceSettings'))
const PlaybackSettings = lazy(() => import('@/views/settings/PlaybackSettings'))
const SystemSettings = lazy(() => import('@/views/settings/SystemSettings'))
const AboutSettings = lazy(() => import('@/views/settings/AboutSettings'))

// Player views
const StandardPlayer = lazy(() => import('@/views/player/StandardPlayer'))
const RawPlayer = lazy(() => import('@/views/player/RawPlayer'))

// Loading fallback
const LoadingFallback = () => (
  <div className="flex flex-col items-center py-40">
    <Spinner size="lg" label="加载中..." />
  </div>
)

// Suspense wrapper for lazy components
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
)

const router = createBrowserRouter([
  // A. 核心布局路由 (带顶部导航)
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <HomeView />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'search',
        element: (
          <SuspenseWrapper>
            <SearchHubView />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'favorites',
        element: (
          <SuspenseWrapper>
            <FavoritesView />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'history',
        element: (
          <SuspenseWrapper>
            <HistoryView />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'settings',
        element: <SettingsLayout />,
        children: [
          { index: true, element: <Navigate to="source" replace /> },
          {
            path: 'source',
            element: (
              <SuspenseWrapper>
                <SourceSettings />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'playback',
            element: (
              <SuspenseWrapper>
                <PlaybackSettings />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'system',
            element: (
              <SuspenseWrapper>
                <SystemSettings />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'about',
            element: (
              <SuspenseWrapper>
                <AboutSettings />
              </SuspenseWrapper>
            ),
          },
        ],
      },
    ],
  },

  // B. 播放页路由 (独立全屏，不复用 MainLayout)
  {
    path: '/play',
    element: <PlayerLayout />,
    children: [
      // 模式 1: 标准元数据模式 (TMDB) - 未来功能
      {
        path: ':type/:tmdbId',
        element: (
          <SuspenseWrapper>
            <StandardPlayer />
          </SuspenseWrapper>
        ),
      },
      // 模式 2: 源文件直连模式 (Raw)
      {
        path: 'raw',
        element: (
          <SuspenseWrapper>
            <RawPlayer />
          </SuspenseWrapper>
        ),
      },
    ],
  },
])

/**
 * AppRouter - 应用路由入口
 * 使用 createBrowserRouter 实现新路由结构
 */
export default function AppRouter() {
  return (
    <AuthGuard>
      <RouterProvider router={router} />
    </AuthGuard>
  )
}
