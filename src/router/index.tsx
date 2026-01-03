import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router'
import { Spinner } from '@/components/ui/spinner'

// Layouts
import MainLayout from '@/layouts/MainLayout'
import PlayerLayout from '@/layouts/PlayerLayout'
import SettingsLayout from '@/layouts/SettingsLayout'

// Auth
const AuthGuard = lazy(() => import('@/features/auth/components/AuthGuard'))

// Views (lazy loaded from features)
const HomeView = lazy(() => import('@/features/home/views/HomeView'))
const SearchHubView = lazy(() => import('@/features/search/views/SearchHubView'))
const FavoritesView = lazy(() => import('@/features/favorites/views/FavoritesView'))
const HistoryView = lazy(() => import('@/features/history/views/HistoryView'))

// Settings sub-routes
const SourceSettings = lazy(() => import('@/features/settings/views/SourceSettings'))
const PlaybackSettings = lazy(() => import('@/features/settings/views/PlaybackSettings'))
const SystemSettings = lazy(() => import('@/features/settings/views/SystemSettings'))
const AboutSettings = lazy(() => import('@/features/settings/views/AboutSettings'))

// Player views
const StandardPlayer = lazy(() => import('@/features/player/components/StandardPlayer'))
const RawPlayer = lazy(() => import('@/features/player/components/RawPlayer'))

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
    <Suspense fallback={<LoadingFallback />}>
      <AuthGuard>
        <RouterProvider router={router} />
      </AuthGuard>
    </Suspense>
  )
}
