import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input, Button } from '@heroui/react'
import { useAuthStore } from '@/store/authStore'
import { OkiLogo } from '@/components/icons'
import { toast } from 'sonner'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { login, validateSession } = useAuthStore()
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  const accessPassword = import.meta.env.VITE_ACCESS_PASSWORD
  const isProtectionEnabled = !!accessPassword && accessPassword.trim() !== ''

  useEffect(() => {
    const checkAuth = async () => {
      if (!isProtectionEnabled) {
        setIsAuthenticated(true)
        return
      }
      const isValid = await validateSession()
      setIsAuthenticated(isValid)
    }
    checkAuth()
  }, [validateSession, isProtectionEnabled])

  // While checking auth status, show nothing or a loading spinner?
  // Showing nothing avoids flash of content.
  if (isProtectionEnabled && isAuthenticated === null) {
    return null
  }

  // If protection disabled or authenticated, show children
  if (!isProtectionEnabled || isAuthenticated) {
    return <>{children}</>
  }

  const handleLogin = async () => {
    setIsLoading(true)
    // Small artificial delay for better UX
    await new Promise(resolve => setTimeout(resolve, 600))

    const success = await login(password)
    if (success) {
      setIsAuthenticated(true)
      toast.success('验证成功')
    } else {
      toast.error('验证失败')
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-3xl"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="flex w-[90vw] max-w-md flex-col items-center gap-6 rounded-3xl border border-black/5 bg-white/40 p-8 shadow-2xl backdrop-blur-2xl md:p-12"
        >
          <div className="mb-2">
            <OkiLogo size={80} />
          </div>

          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900 drop-shadow-sm">访问受限</h1>
            <p className="text-gray-500">当前站点通过密码保护，请输入访问密码</p>
          </div>

          <div className="w-full space-y-4">
            <Input
              type="password"
              placeholder="请输入访问密码"
              value={password}
              onValueChange={setPassword}
              onKeyDown={handleKeyDown}
              size="lg"
              variant="bordered"
              classNames={{
                inputWrapper:
                  'bg-black/5 border-black/10 hover:border-black/20 focus-within:!border-black/40 text-black shadow-inner',
                input: 'text-black placeholder:text-gray-400',
              }}
              isClearable
            />

            <Button
              className="w-full bg-black font-bold text-white shadow-lg hover:bg-gray-800"
              size="lg"
              onPress={handleLogin}
              isLoading={isLoading}
            >
              进入网站
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
