import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { usePersonalConfig } from '@/hooks/usePersonalConfig'

export function URLConfigModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const urlSchema = z.object({
    url: z.string().regex(/^(http|https):\/\/.*\.json$/, '请输入有效的URL,且以.json结尾'),
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
      <DialogContent
        className="h-fit bg-white/20 backdrop-blur-md"
        overlayClassName="bg-white/40 backdrop-blur-xs"
      >
        <DialogHeader>
          <DialogTitle>从 URL 导入个人配置</DialogTitle>
          <DialogDescription>请输入有效的 URL，即配置 JSON 文件的直链 URL</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 pb-6">
            <div className="grid gap-3">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                {...register('url')}
                placeholder="https://example.com/config.json"
                className={errors.url ? 'border-red-500' : ''}
              />
              {errors.url && <p className="text-sm text-red-500">{errors.url.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => reset()}>
                取消
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              导入
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
          return typeof parsed === 'object' && parsed !== null // Basic object check
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

  const onSubmit = (data: TextSchema) => {
    const success = importConfigFromText(data.content)
    if (success) {
      onOpenChange(false)
      reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="h-fit bg-white/20 backdrop-blur-md"
        overlayClassName="bg-white/40 backdrop-blur-xs"
      >
        <DialogHeader>
          <DialogTitle>从文本导入个人配置</DialogTitle>
          <DialogDescription>请粘贴配置 JSON 内容</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 pb-6">
            <div className="grid gap-3">
              <Label htmlFor="content">JSON 内容</Label>
              <Textarea
                id="content"
                {...register('content')}
                placeholder='{"settings": {...}, "videoSources": [...]}'
                className={`max-h-50 min-h-50 md:max-h-100 ${errors.content ? 'border-red-500' : ''}`}
              />
              {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => reset()}>
                取消
              </Button>
            </DialogClose>
            <Button type="submit">导入</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
