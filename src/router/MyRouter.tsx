import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router'
import { AnimatePresence } from 'framer-motion'
import { Spinner } from '@heroui/spinner'
import SettingsPage from '@/pages/Settings'

const Layout = lazy(() => import('@/components/layouts/Layout'))
const SearchResult = lazy(() => import('@/pages/SearchResult'))
const Detail = lazy(() => import('@/pages/Detail'))
const Video = lazy(() => import('@/pages/Video'))

import { useApiStore } from '@/store/apiStore'
import { useSearchStore } from '@/store/searchStore'
import { useEffect } from 'react'

import AuthGuard from '@/components/AuthGuard'

function AnimatedRoutes({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { initializeEnvSources } = useApiStore()
  const { cleanExpiredCache } = useSearchStore()

  useEffect(() => {
    // 清理过期的搜索缓存
    cleanExpiredCache()

    // 检查是否需要初始化
    const needsInitialization = localStorage.getItem('envSourcesInitialized') !== 'true'
    if (needsInitialization) {
      // 初始化环境变量中的视频源
      initializeEnvSources()
      localStorage.setItem('envSourcesInitialized', 'true')
    }
  }, [initializeEnvSources, cleanExpiredCache])

  return (
    <AuthGuard>
      <AnimatePresence mode="wait">
        <Suspense
          fallback={
            <div className="flex flex-col items-center py-40">
              <Spinner
                classNames={{ label: 'text-gray-500 text-sm' }}
                variant="default"
                size="lg"
                color="default"
                label="加载中..."
              />
            </div>
          }
        >
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={children} />
            <Route element={<Layout />}>
              <Route path="search/:query" element={<SearchResult />} />
              <Route path="video/:sourceCode/:vodId/:episodeIndex" element={<Video />} />
              <Route path="detail/:sourceCode/:vodId" element={<Detail />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Suspense>
      </AnimatePresence>
    </AuthGuard>
  )
}

export default function MyRouter({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AnimatedRoutes>{children}</AnimatedRoutes>
    </BrowserRouter>
  )
}
