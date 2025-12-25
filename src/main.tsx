import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/main.css'
import { HeroUIProvider, ToastProvider } from '@heroui/react'
import { ThemeProvider } from 'next-themes'
import AppRouter from '@/router'
import { Toaster } from '@/components/ui/sonner'
import { ThemeInitializer, ThemeToggle } from '@/components/theme'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

const root = document.getElementById('root')!

const app = (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <HeroUIProvider>
      <ThemeInitializer />
      <ToastProvider placement="top-center" toastOffset={68} />
      {/* 全局主题切换按钮 - 固定在左下角 */}
      <div className="fixed bottom-5 left-5 z-[9999]">
        <ThemeToggle />
      </div>
      <AppRouter />
      <Toaster richColors position="top-center" />
      {import.meta.env.VITE_DISABLE_ANALYTICS !== 'true' && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </HeroUIProvider>
  </ThemeProvider>
)

createRoot(root).render(import.meta.env.DEVELOPMENT ? <StrictMode>{app}</StrictMode> : app)
