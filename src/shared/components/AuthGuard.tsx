import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Lock } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Spinner } from '@/shared/components/ui/spinner'
import { useAuthStore } from '@/shared/store/authStore'
import { OkiLogo } from '@/shared/components/icons'
import { toast } from 'sonner'

interface AuthGuardProps {
  children: React.ReactNode
}

const easeOutQuad = [0.25, 0.46, 0.45, 0.94] as const

export default function AuthGuard({ children }: AuthGuardProps) {
  const { login, validateSession } = useAuthStore()
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isDismissing, setIsDismissing] = useState(false)
  const revealRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const revealOriginRef = useRef('50% 50%')

  const accessPassword = import.meta.env.OKI_ACCESS_PASSWORD
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

  // 验证成功后，从按钮位置扩散圆形 clip-path 揭开页面内容
  useEffect(() => {
    if (!isDismissing) return

    const reveal = revealRef.current
    if (reveal) {
      const origin = revealOriginRef.current
      const animation = reveal.animate(
        [
          { clipPath: `circle(0% at ${origin})` },
          { clipPath: `circle(150% at ${origin})` },
        ],
        {
          duration: 600,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          fill: 'forwards',
        },
      )
      animation.onfinish = () => setIsAuthenticated(true)

      return () => animation.cancel()
    }

    setIsAuthenticated(true)
  }, [isDismissing])

  if (isProtectionEnabled && isAuthenticated === null) {
    return null
  }

  if (!isProtectionEnabled || isAuthenticated) {
    return <>{children}</>
  }

  const handleLogin = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 600))

    const success = await login(password)
    if (success) {
      toast.success('验证成功')
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        revealOriginRef.current = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`
      }
      setIsDismissing(true)
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
    <>
      {/* 验证成功后渲染页面内容，clip-path 从按钮位置向外扩散 */}
      {isDismissing && (
        <div
          ref={revealRef}
          className="fixed inset-0 z-[10000]"
          style={{ clipPath: `circle(0% at ${revealOriginRef.current})` }}
        >
          {children}
        </div>
      )}

      {/* 守卫层 */}
      <div
        className="fixed inset-0 z-[9999] flex flex-col bg-background md:flex-row"
      >
        {/* 左侧品牌区 — 移动端顶部横栏，桌面端左侧半屏 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: easeOutQuad }}
          className="relative flex shrink-0 flex-col items-center justify-center overflow-hidden bg-muted/40 px-8 py-12 md:w-1/2 md:py-0"
        >
          {/* 装饰性模糊光晕 */}
          <div className="pointer-events-none absolute -top-20 -left-20 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 -bottom-16 size-56 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative flex flex-col items-center gap-4">
            <motion.div
              initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.5, delay: 0.1, ease: easeOutQuad }}
              className="flex flex-col items-center gap-3"
            >
              <OkiLogo size={80} />
              <div className="text-xl font-bold tracking-widest">OUONNKI TV</div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25, ease: easeOutQuad }}
              className="max-w-xs text-center text-sm text-muted-foreground"
            >
              你的私人流媒体影院
            </motion.p>
          </div>
        </motion.div>

        {/* 右侧表单区 — 移动端占满剩余空间，桌面端右侧半屏 */}
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 md:px-16">
          <div className="w-full max-w-sm space-y-8">
            {/* 信息区域 */}
            <motion.div
              initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.5, delay: 0.15, ease: easeOutQuad }}
              className="space-y-4"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-muted/70 ring-1 ring-border/60">
                <Lock className="size-5 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">访问受限</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  当前站点通过密码保护，请输入访问密码以继续
                </p>
              </div>
            </motion.div>

            {/* 表单区域 */}
            <motion.div
              initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.5, delay: 0.25, ease: easeOutQuad }}
            >
              <div className="flex items-center gap-2">
                <Input
                  type="password"
                  placeholder="请输入访问密码"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-11 rounded-full"
                />
                <Button
                  ref={buttonRef}
                  size="icon-lg"
                  className="shrink-0 rounded-full"
                  onClick={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner size="sm" /> : <ArrowRight className="size-5" />}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
