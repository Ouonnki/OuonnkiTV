import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/main.css'
import { HeroUIProvider, ToastProvider } from '@heroui/react'
import App from '@/App'
import MyRouter from '@/router/MyRouter'
import { Toaster } from '@/components/ui/sonner'

const root = document.getElementById('root')!

const app = (
  <HeroUIProvider>
    <ToastProvider placement="top-center" toastOffset={68} />
    <MyRouter>
      <App />
    </MyRouter>
    <Toaster richColors position="top-center" />
  </HeroUIProvider>
)

createRoot(root).render(import.meta.env.DEVELOPMENT ? <StrictMode>{app}</StrictMode> : app)
