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
import { useApiStore } from '@/store/apiStore'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function URLSourceModal({
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

  // 提交
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
      <DialogContent
        className="h-fit bg-white/20 backdrop-blur-md"
        overlayClassName="bg-white/40 backdrop-blur-xs"
      >
        <DialogHeader>
          <DialogTitle>从 URL 导入视频源</DialogTitle>
          <DialogDescription>请输入有效的 URL，即 JSON 文件的直链 URL</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 pb-6">
            <div className="grid gap-3">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                {...register('url')}
                placeholder="https://example.com/source.json"
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

import { Textarea } from '@/components/ui/textarea'

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
      <DialogContent
        className="h-fit bg-white/20 backdrop-blur-md"
        overlayClassName="bg-white/40 backdrop-blur-xs"
      >
        <DialogHeader>
          <DialogTitle>从文本导入视频源</DialogTitle>
          <DialogDescription>请粘贴 JSON 格式的视频源配置数组</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 pb-6">
            <div className="grid gap-3">
              <Label htmlFor="content">JSON 内容</Label>
              <Textarea
                id="content"
                {...register('content')}
                placeholder='[{"name": "example", "url": "..."}]'
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
