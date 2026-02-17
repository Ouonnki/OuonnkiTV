import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Switch } from '@/shared/components/ui/switch'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { ConfirmModal } from '@/shared/components/common/ConfirmModal'
import { useApiStore } from '@/shared/store/apiStore'
import { toast } from 'sonner'
import { cn } from '@/shared/lib'
import { z } from 'zod'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { v4 as uuidv4 } from 'uuid'
import { ChevronsUpDown } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import type { VideoApi } from '@/shared/types'

const formSchema = z.object({
  id: z.string().min(1, '视频源ID不能为空').default(uuidv4()),
  name: z.string().min(1, '视频源名称不能为空').default('视频源1'),
  url: z.string().regex(/^(http|https):\/\//, '请输入有效的URL'),
  detailUrl: z
    .string()
    .regex(/^(http|https):\/\//, '请输入有效的URL')
    .or(z.literal(''))
    .optional(),
  timeout: z.coerce.number().min(300, '超时时间需要大于等于300ms').optional(),
  retry: z.coerce.number().min(0, '重试次数需要大于等于0').optional(),
  updatedAt: z.coerce.date().default(() => new Date()),
  isEnabled: z.boolean().default(true),
})

type FormSchema = z.infer<typeof formSchema>

interface VideoSourceEditDialogProps {
  source: VideoApi | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function VideoSourceEditDialog({
  source,
  open,
  onOpenChange,
}: VideoSourceEditDialogProps) {
  const { addAndUpdateVideoAPI, removeVideoAPI, videoAPIs } = useApiStore()
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [isRandomId, setIsRandomId] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const isEditing = source !== null && source.url !== ''

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema) as Resolver<FormSchema>,
    defaultValues: source ?? undefined,
  })

  // source 变化时重置表单
  useEffect(() => {
    if (source) {
      reset(source)
      setIsRandomId(false)
      setAdvancedOpen(false)
    }
  }, [source, reset])

  const handleSave = (data: FormSchema) => {
    if (source && data.id !== source.id) {
      if (videoAPIs.some(api => api.id === data.id)) {
        toast.error('保存失败，视频源ID已存在')
        return
      }
      removeVideoAPI(source.id)
    }
    addAndUpdateVideoAPI(data)
    toast.success('保存成功')
    onOpenChange(false)
  }

  const handleDelete = () => {
    if (!source) return
    removeVideoAPI(source.id)
    toast.success('删除成功')
    onOpenChange(false)
  }

  if (!source) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex h-[80vh] max-h-[90vh] flex-col gap-4 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? '编辑视频源' : '添加视频源'}</DialogTitle>
            <DialogDescription>
              {isEditing ? '修改视频源的配置信息。' : '填写视频源基本信息后点击保存。'}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="min-h-0 flex-1">
            <form
              id="video-source-form"
              onSubmit={handleSubmit(handleSave, () =>
                toast.error('保存失败，请检查表单填写是否正确'),
              )}
              className="px-1"
            >
              <div className="grid gap-4 py-1">
              {/* 名称 */}
              <div className="grid gap-2">
                <Label htmlFor="name">视频源名称</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="例如：视频源1"
                  className={cn(errors.name && 'border-destructive focus-visible:ring-destructive/30')}
                />
                {errors.name && (
                  <p className="text-destructive text-sm">{errors.name.message}</p>
                )}
              </div>

              {/* URL */}
              <div className="grid gap-2">
                <Label htmlFor="url">视频源 URL</Label>
                <Input
                  id="url"
                  type="url"
                  {...register('url')}
                  placeholder="https://example.com/api"
                  className={cn(errors.url && 'border-destructive focus-visible:ring-destructive/30')}
                />
                {errors.url && (
                  <p className="text-destructive text-sm">{errors.url.message}</p>
                )}
              </div>

              {/* 详情 URL */}
              <div className="grid gap-2">
                <Label htmlFor="detailUrl">
                  详情 URL{' '}
                  <span className="text-muted-foreground text-xs font-normal">
                    （可选，留空使用视频源 URL）
                  </span>
                </Label>
                <Input
                  id="detailUrl"
                  type="url"
                  {...register('detailUrl')}
                  placeholder="https://example.com/detail"
                />
              </div>

              {/* 超时 + 重试 并排 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="timeout">超时时间 (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    {...register('timeout')}
                    placeholder="3000"
                    className={cn(
                      errors.timeout && 'border-destructive focus-visible:ring-destructive/30',
                    )}
                  />
                  {errors.timeout && (
                    <p className="text-destructive text-xs">{errors.timeout.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="retry">重试次数</Label>
                  <Input
                    id="retry"
                    type="number"
                    {...register('retry')}
                    placeholder="3"
                    className={cn(
                      errors.retry && 'border-destructive focus-visible:ring-destructive/30',
                    )}
                  />
                  {errors.retry && (
                    <p className="text-destructive text-xs">{errors.retry.message}</p>
                  )}
                </div>
              </div>

              {/* 启用 */}
              <div className="flex items-center justify-between rounded-lg">
                <Label htmlFor="isEnabled">启用视频源</Label>
                <Controller
                  control={control}
                  name="isEnabled"
                  render={({ field }) => (
                    <Switch
                      id="isEnabled"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              {/* 高级：视频源 ID */}
              <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground flex w-full items-center gap-1 text-xs transition-colors"
                  >
                    <ChevronsUpDown className="size-3.5" />
                    高级选项
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <div className="grid gap-2">
                    <Label htmlFor="id">视频源 ID</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="id"
                        {...register('id')}
                        placeholder="例如：source1"
                        disabled={isRandomId}
                        className={cn(
                          'flex-1',
                          errors.id && 'border-destructive focus-visible:ring-destructive/30',
                        )}
                      />
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Checkbox
                          id="randomId"
                          checked={isRandomId}
                          onCheckedChange={(checked: boolean) => {
                            setIsRandomId(checked)
                            if (checked) setValue('id', uuidv4())
                          }}
                        />
                        <Label htmlFor="randomId" className="text-xs">
                          随机
                        </Label>
                      </div>
                    </div>
                    {errors.id && (
                      <p className="text-destructive text-sm">{errors.id.message}</p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
            </form>
          </ScrollArea>

          <DialogFooter className="shrink-0 flex-row gap-2">
            {isEditing && (
              <Button
                variant="ghost"
                type="button"
                className="mr-auto text-red-600 hover:text-red-500"
                onClick={() => setConfirmDeleteOpen(true)}
              >
                删除
              </Button>
            )}
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>
            <Button type="submit" form="video-source-form">
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="确定要删除本视频源吗？"
        description="此操作无法撤销，确认后将永久删除本视频源，请谨慎操作。"
        confirmText="确定删除"
        isDestructive
      />
    </>
  )
}
