import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@/styles/main.css'
import { ThemeProvider } from 'next-themes'
import AppRouter from '@/router'
import { Toaster } from '@/components/ui/sonner'
import { ThemeInitializer, ThemeToggle } from '@/components/theme'
import { TooltipProvider } from '@/components/ui/tooltip'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

const root = document.getElementById('root')!

const app = (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <TooltipProvider>
      <ThemeInitializer />
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
    </TooltipProvider>
  </ThemeProvider>
)

createRoot(root).render(import.meta.env.DEVELOPMENT ? <StrictMode>{app}</StrictMode> : app)
