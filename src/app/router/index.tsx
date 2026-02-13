import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router'
import { OkiLogo } from '@/shared/components/icons'

// Layouts
import MainLayout from '@/app/layouts/MainLayout'
import PlayerLayout from '@/app/layouts/PlayerLayout'
import SettingsLayout from '@/app/layouts/SettingsLayout'

// Auth
const AuthGuard = lazy(() => import('@/shared/components/AuthGuard'))

// Views (lazy loaded from features)
const HomeView = lazy(() => import('@/features/home/views/HomeView'))
const SearchHubView = lazy(() => import('@/features/search/views/SearchHubView'))
const FavoritesView = lazy(() => import('@/features/favorites/views/FavoritesView'))
const HistoryView = lazy(() => import('@/features/history/views/HistoryView'))
const TmdbDetailView = lazy(() => import('@/features/media/views/TmdbDetailView'))

// Settings sub-routes
const SourceSettings = lazy(() => import('@/features/settings/views/SourceSettings'))
const PlaybackSettings = lazy(() => import('@/features/settings/views/PlaybackSettings'))
const SystemSettings = lazy(() => import('@/features/settings/views/SystemSettings'))
const AboutSettings = lazy(() => import('@/features/settings/views/AboutSettings'))

// Player views
const UnifiedPlayer = lazy(() => import('@/features/player/components/UnifiedPlayer'))

// Loading fallback
const LoadingFallback = () => {
  return (
    <div className="flex h-dvh items-center justify-center">
      <div className="flex -translate-y-1/2 flex-col items-center justify-center gap-3">
        <OkiLogo size={80} />
        <div className="text-xl font-bold tracking-widest">OUONNKI TV</div>
        <div className="bg-primary/20 h-1 w-30 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full w-full origin-left"
            style={{
              animation: 'progress-indeterminate 1.5s infinite ease-in-out',
            }}
          />
        </div>
      </div>
    </div>
  )
}

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
        path: 'media/:type/:tmdbId',
        element: (
          <SuspenseWrapper>
            <TmdbDetailView />
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
            <UnifiedPlayer />
          </SuspenseWrapper>
        ),
      },
      // 模式 2: 源文件直连模式 (Raw)
      {
        path: 'cms/:sourceCode/:vodId',
        element: (
          <SuspenseWrapper>
            <UnifiedPlayer />
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
