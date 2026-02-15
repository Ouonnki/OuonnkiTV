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
import { Textarea } from '@/shared/components/ui/textarea'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useApiStore } from '@/shared/store/apiStore'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib'

export function URLSourceModal({
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
  const { importVideoAPIs } = useApiStore()
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
      const response = await fetch(data.url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const sources = await response.json()
      if (Array.isArray(sources)) {
        importVideoAPIs(sources)
        toast.success(`成功导入 ${sources.length} 个视频源`)
        onOpenChange(false)
        reset()
      } else {
        toast.error('导入失败：文件格式错误，应为数组格式')
      }
    } catch (error) {
      console.error('Import error:', error)
      toast.error('导入失败：请求错误或解析失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-fit sm:max-w-md">
        <DialogHeader>
          <DialogTitle>从 URL 导入视频源</DialogTitle>
          <DialogDescription>请输入有效的 URL，即 JSON 文件的直链地址。</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-1">
            <div className="grid gap-2">
              <Label htmlFor="url">URL 地址</Label>
              <Input
                id="url"
                {...register('url')}
                placeholder="https://example.com/source.json"
                className={cn(errors.url && 'border-destructive focus-visible:ring-destructive/30')}
              />
              {errors.url && <p className="text-destructive text-sm">{errors.url.message}</p>}
            </div>

            <div className="text-muted-foreground bg-muted/30 rounded-md border border-dashed px-3 py-2 text-xs">
              导入后会自动进行字段校验，并跳过重复数据。
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
              导入
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function TextSourceModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { importVideoAPIs } = useApiStore()
  const textSchema = z.object({
    content: z.string().refine(
      val => {
        try {
          const parsed = JSON.parse(val)
          return Array.isArray(parsed)
        } catch {
          return false
        }
      },
      {
        message: '请输入有效的 JSON 数组格式',
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
    try {
      const sources = JSON.parse(data.content)
      importVideoAPIs(sources)
      toast.success(`成功导入 ${sources.length} 个视频源`)
      onOpenChange(false)
      reset()
    } catch (error) {
      console.error('Import error:', error)
      toast.error('导入失败：JSON 解析错误')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-fit max-h-[85vh] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>从文本导入视频源</DialogTitle>
          <DialogDescription>请粘贴 JSON 数组格式的视频源配置内容。</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-col">
          <div className="grid min-h-0 gap-4 overflow-y-auto py-2 pr-1">
            <div className="grid gap-2">
              <Label htmlFor="content">JSON 内容</Label>
              <Textarea
                id="content"
                {...register('content')}
                placeholder='[{"name": "示例源", "url": "https://example.com"}]'
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
            <Button type="submit">导入</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
