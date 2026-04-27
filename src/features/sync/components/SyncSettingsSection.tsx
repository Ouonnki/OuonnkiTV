import { useState } from 'react'
import { Loader2, LogIn, RefreshCcw, ShieldCheck, UserPlus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import { SettingsItem, SettingsSection } from '@/features/settings/components/common'
import { useSyncStore } from '../store/syncStore'

type AuthMode = 'login' | 'register'

export default function SyncSettingsSection() {
  const {
    session,
    isCheckingSession,
    isSyncing,
    lastSyncedAt,
    lastError,
    login,
    register,
    logout,
    syncNow,
  } = useSyncStore()

  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const isAuthenticated = Boolean(session)

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) return

    const payload = {
      username: username.trim(),
      password,
    }

    if (authMode === 'login') {
      await login(payload)
      return
    }

    await register(payload)
  }

  return (
    <SettingsSection
      title="多设备同步"
      description="使用轻量账号在不同设备之间同步收藏、历史、搜索记录、主题、非敏感设置、手动视频源和订阅配置。"
      icon={<ShieldCheck className="size-4" />}
      tone="cyan"
      action={
        isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 px-3" onClick={() => void syncNow()}>
              {isSyncing ? (
                <Loader2 className="mr-1 size-3.5 animate-spin" />
              ) : (
                <RefreshCcw className="mr-1 size-3.5" />
              )}
              立即同步
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3"
              onClick={() => void logout()}
            >
              退出账号
            </Button>
          </div>
        ) : null
      }
    >
      <SettingsItem
        title="同步状态"
        description={
          isCheckingSession
            ? '正在检查同步会话状态。'
            : isAuthenticated
              ? `当前账号：${session?.user.username}`
              : '当前未登录，同步功能处于关闭状态。'
        }
        control={
          <Badge variant={isAuthenticated ? 'default' : 'outline'} className="font-normal">
            {isCheckingSession ? '检查中' : isAuthenticated ? '已连接' : '未连接'}
          </Badge>
        }
      />

      <SettingsItem
        title="最近同步"
        description={
          lastSyncedAt
            ? new Date(lastSyncedAt).toLocaleString('zh-CN')
            : '还没有完成过云端同步。'
        }
      />

      {lastError ? (
        <SettingsItem title="最近错误" description={lastError} className="border border-red-500/15" />
      ) : null}

      {!isAuthenticated ? (
        <div className="bg-muted/35 rounded-lg px-4 py-4">
          <div className="mb-3 flex gap-2">
            <Button
              variant={authMode === 'login' ? 'default' : 'outline'}
              size="sm"
              className="h-8 px-3"
              onClick={() => setAuthMode('login')}
            >
              <LogIn className="mr-1 size-3.5" />
              登录
            </Button>
            <Button
              variant={authMode === 'register' ? 'default' : 'outline'}
              size="sm"
              className="h-8 px-3"
              onClick={() => setAuthMode('register')}
            >
              <UserPlus className="mr-1 size-3.5" />
              注册
            </Button>
          </div>

          <div className="grid gap-3">
            <Input
              value={username}
              onChange={event => setUsername(event.target.value)}
              placeholder="用户名"
              autoComplete="username"
            />
            <Input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="密码（至少 8 位）"
              autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  void handleSubmit()
                }
              }}
            />
            <Button onClick={() => void handleSubmit()} disabled={isSyncing}>
              {isSyncing && <Loader2 className="mr-2 size-4 animate-spin" />}
              {authMode === 'login' ? '登录并同步' : '注册并同步'}
            </Button>
          </div>
        </div>
      ) : null}
    </SettingsSection>
  )
}
