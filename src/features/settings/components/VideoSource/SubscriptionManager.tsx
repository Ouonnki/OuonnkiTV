import { useState } from 'react'
import { toast } from 'sonner'
import { Rss, RefreshCw, Trash2, Clock, AlertCircle, Loader2, Activity } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { SettingsSection } from '../common'
import { ConfirmModal } from '@/shared/components/common/ConfirmModal'
import { useSubscriptionStore } from '@/shared/store/subscriptionStore'
import { batchCheckSubscriptions } from '@/shared/lib/health-check'
import SubscriptionHealthBadge from './SubscriptionHealthBadge'
import type { VideoSourceSubscription } from '@/shared/types/subscription'
import { cn } from '@/shared/lib'
import dayjs from 'dayjs'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// ==================== 刷新间隔选项 ====================

const REFRESH_INTERVAL_OPTIONS = [
  { value: '0', label: '不自动刷新' },
  { value: '30', label: '30 分钟' },
  { value: '60', label: '1 小时' },
  { value: '360', label: '6 小时' },
  { value: '720', label: '12 小时' },
  { value: '1440', label: '24 小时' },
]

// ==================== 添加订阅弹窗 ====================

const addSubscriptionSchema = z.object({
  url: z.string().url('请输入有效的 URL'),
  name: z.string().optional(),
  refreshInterval: z.string(),
})

type AddSubscriptionForm = z.infer<typeof addSubscriptionSchema>

function AddSubscriptionModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { addSubscription } = useSubscriptionStore()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddSubscriptionForm>({
    resolver: zodResolver(addSubscriptionSchema),
    defaultValues: { refreshInterval: '60' },
  })

  const refreshInterval = watch('refreshInterval')

  const onSubmit = async (data: AddSubscriptionForm) => {
    setIsLoading(true)
    try {
      await addSubscription(
        data.url,
        data.name || undefined,
        Number.parseInt(data.refreshInterval, 10),
      )
      onOpenChange(false)
      reset()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-fit sm:max-w-md">
        <DialogHeader>
          <DialogTitle>添加视频源订阅</DialogTitle>
          <DialogDescription>
            输入返回 JSON 数组格式视频源的 URL，系统将自动定期同步。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-1">
            <div className="grid gap-2">
              <Label htmlFor="sub-url">订阅 URL</Label>
              <Input
                id="sub-url"
                {...register('url')}
                placeholder="https://example.com/sources.json"
                className={cn(errors.url && 'border-destructive focus-visible:ring-destructive/30')}
              />
              {errors.url && <p className="text-destructive text-sm">{errors.url.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sub-name">
                订阅名称 <span className="text-muted-foreground text-xs font-normal">（可选）</span>
              </Label>
              <Input id="sub-name" {...register('name')} placeholder="留空则自动使用域名" />
            </div>

            <div className="grid gap-2">
              <Label>自动刷新间隔</Label>
              <Select
                value={refreshInterval}
                onValueChange={val => setValue('refreshInterval', val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REFRESH_INTERVAL_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-muted-foreground bg-muted/30 rounded-md border border-dashed px-3 py-2 text-xs">
              订阅源由远程 URL 维护，不可手动编辑或删除单个源。取消订阅即移除全部。
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => reset()}>
                取消
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              订阅
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ==================== 订阅项卡片 ====================

function SubscriptionCard({ subscription }: { subscription: VideoSourceSubscription }) {
  const { refreshSubscription, removeSubscription, setRefreshInterval } = useSubscriptionStore()
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshSubscription(subscription.id)
    setIsRefreshing(false)
  }

  return (
    <>
      <div className="bg-muted/35 space-y-2 rounded-lg px-4 py-3">
        {/* 第一行：名称 + 状态 + 操作 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Rss className="size-4 shrink-0 text-violet-600 dark:text-violet-400" />
            <p className="truncate text-sm font-medium">{subscription.name}</p>
            <Badge
              variant="outline"
              className={cn(
                'shrink-0 text-xs',
                subscription.lastRefreshSuccess
                  ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : subscription.lastRefreshedAt
                    ? 'border-red-500/30 text-red-600 dark:text-red-400'
                    : 'border-muted-foreground/30',
              )}
            >
              {subscription.lastRefreshSuccess
                ? `${subscription.sourceCount} 个源`
                : subscription.lastRefreshedAt
                  ? '刷新失败'
                  : '未刷新'}
            </Badge>
            <SubscriptionHealthBadge subscriptionId={subscription.id} />
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn('size-3.5', isRefreshing && 'animate-spin')} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-red-500 hover:text-red-600"
              onClick={() => setConfirmRemoveOpen(true)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* 第二行：URL + 上次刷新时间 */}
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <button
            type="button"
            className="max-w-xs cursor-pointer truncate underline-offset-2 hover:underline"
            onClick={() => {
              navigator.clipboard.writeText(subscription.url)
              toast.success('已复制订阅 URL')
            }}
            title="点击复制"
          >
            {subscription.url}
          </button>
          {subscription.lastRefreshedAt && (
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {dayjs(subscription.lastRefreshedAt).format('MM-DD HH:mm')}
            </span>
          )}
        </div>

        {/* 第三行：自动刷新间隔设置 */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">自动刷新：</span>
          <Select
            value={String(subscription.refreshInterval)}
            onValueChange={val => setRefreshInterval(subscription.id, Number.parseInt(val, 10))}
          >
            <SelectTrigger className="h-7 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REFRESH_INTERVAL_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 刷新失败时显示错误信息 */}
        {subscription.lastRefreshError && (
          <div className="flex items-start gap-1.5 rounded bg-red-500/5 px-2 py-1 text-xs text-red-500">
            <AlertCircle className="mt-0.5 size-3 shrink-0" />
            <span>{subscription.lastRefreshError}</span>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmRemoveOpen}
        onClose={() => setConfirmRemoveOpen(false)}
        onConfirm={() => removeSubscription(subscription.id)}
        title="确认取消订阅？"
        description={`取消订阅「${subscription.name}」后，该订阅下的所有视频源将被移除。此操作无法撤销。`}
        confirmText="确认取消"
        isDestructive
      />
    </>
  )
}

// ==================== 订阅管理主组件 ====================

export default function SubscriptionManager() {
  const { subscriptions, refreshAllSubscriptions } = useSubscriptionStore()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [isRefreshingAll, setIsRefreshingAll] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testProgress, setTestProgress] = useState({ completed: 0, total: 0 })

  const handleRefreshAll = async () => {
    setIsRefreshingAll(true)
    await refreshAllSubscriptions()
    setIsRefreshingAll(false)
  }

  const handleBatchCheck = async () => {
    setIsTesting(true)
    setTestProgress({ completed: 0, total: subscriptions.length })
    await batchCheckSubscriptions(subscriptions, (completed, total) => {
      setTestProgress({ completed, total })
    })
    setIsTesting(false)
  }

  return (
    <>
      <AddSubscriptionModal open={addModalOpen} onOpenChange={setAddModalOpen} />
      <SettingsSection
        title="视频源订阅"
        description="订阅远程视频源列表，自动同步更新。订阅源不可手动编辑。"
        icon={<Rss className="size-4" />}
        tone="violet"
        action={
          <div className="flex flex-wrap items-center gap-2">
            {subscriptions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3"
                onClick={handleRefreshAll}
                disabled={isRefreshingAll}
              >
                <RefreshCw className={cn('mr-1 size-3.5', isRefreshingAll && 'animate-spin')} />
                刷新
              </Button>
            )}
            {subscriptions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3"
                onClick={handleBatchCheck}
                disabled={isTesting}
              >
                {isTesting ? (
                  <Loader2 className="mr-1 size-3.5 animate-spin" />
                ) : (
                  <Activity className="mr-1 size-3.5" />
                )}
                {isTesting ? `${testProgress.completed}/${testProgress.total}` : '测速'}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3"
              onClick={() => setAddModalOpen(true)}
            >
              添加订阅
            </Button>
          </div>
        }
      >
        {subscriptions.length === 0 ? (
          <div className="text-muted-foreground flex h-20 items-center justify-center text-sm">
            暂无订阅，点击右上角「添加订阅」开始使用。
          </div>
        ) : (
          <div className="space-y-2">
            {subscriptions.map(sub => (
              <SubscriptionCard key={sub.id} subscription={sub} />
            ))}
          </div>
        )}

        {subscriptions.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-violet-500/35 bg-violet-500/8 text-violet-700 dark:text-violet-300"
            >
              {subscriptions.length} 个订阅 ·{' '}
              {subscriptions.reduce((sum, s) => sum + s.sourceCount, 0)} 个源
            </Badge>
          </div>
        )}
      </SettingsSection>
    </>
  )
}
