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
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Textarea } from '@/shared/components/ui/textarea'
import { usePersonalConfig } from '@/shared/hooks/usePersonalConfig'
import { cn } from '@/shared/lib'

export function URLConfigModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const urlSchema = z.object({
    url: z.string().regex(/^(http|https):\/\/.*\.json$/, '请输入有效的 URL，且以 .json 结尾'),
  })

  type URLSchema = z.infer<typeof urlSchema>
  const { importConfigFromURL } = usePersonalConfig()
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<URLSchema>({
    resolver: zodResolver(urlSchema),
  })

  const onSubmit = async (data: URLSchema) => {
    setIsLoading(true)
    try {
      const success = await importConfigFromURL(data.url)
      if (success) {
        onOpenChange(false)
        reset()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-fit sm:max-w-md">
        <DialogHeader>
          <DialogTitle>从 URL 导入个人配置</DialogTitle>
          <DialogDescription>请输入有效的 URL，即配置 JSON 文件的直链地址。</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-1">
            <div className="grid gap-2">
              <Label htmlFor="url">URL 地址</Label>
              <Input
                id="url"
                {...register('url')}
                placeholder="https://example.com/config.json"
                className={cn(errors.url && 'border-destructive focus-visible:ring-destructive/30')}
              />
              {errors.url && <p className="text-destructive text-sm">{errors.url.message}</p>}
            </div>

            <div className="text-muted-foreground bg-muted/30 rounded-md border border-dashed px-3 py-2 text-xs">
              导入将覆盖当前设置和视频源，请确认内容后再执行。
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
              导入配置
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function TextConfigModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { importConfigFromText } = usePersonalConfig()
  const textSchema = z.object({
    content: z.string().refine(
      val => {
        try {
          const parsed = JSON.parse(val)
          return typeof parsed === 'object' && parsed !== null
        } catch {
          return false
        }
      },
      {
        message: '请输入有效的 JSON 格式',
      },
    ),
  })

  type TextSchema = z.infer<typeof textSchema>

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TextSchema>({
    resolver: zodResolver(textSchema),
  })

  const onSubmit = async (data: TextSchema) => {
    const success = await importConfigFromText(data.content)
    if (success) {
      onOpenChange(false)
      reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-fit max-h-[85vh] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>从文本导入个人配置</DialogTitle>
          <DialogDescription>请粘贴完整配置 JSON 内容。</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-col">
          <div className="grid min-h-0 gap-4 overflow-y-auto py-2 pr-1">
            <div className="grid gap-2">
              <Label htmlFor="content">JSON 内容</Label>
              <Textarea
                id="content"
                {...register('content')}
                placeholder='{"settings": {...}, "videoSources": [...]}'
                className={cn(
                  'h-[38vh] max-h-[52vh] min-h-[220px] font-mono text-xs leading-5',
                  errors.content && 'border-destructive focus-visible:ring-destructive/30',
                )}
              />
              {errors.content && (
                <p className="text-destructive text-sm">{errors.content.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => reset()}>
                取消
              </Button>
            </DialogClose>
            <Button type="submit">导入配置</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
