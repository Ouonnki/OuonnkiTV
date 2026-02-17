import { Button } from '@/shared/components/ui/button'
import { CircleX, CircleCheckBig, Database } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useApiStore } from '@/shared/store/apiStore'
import { isSubscriptionSource } from '@/shared/store/subscriptionStore'
import { useSettingStore } from '@/shared/store/settingStore'
import dayjs from 'dayjs'
import { Badge } from '@/shared/components/ui/badge'
import ActionDropdown from '@/shared/components/common/ActionDropdown'
import VideoSourceCard from './VideoSourceCard'
import VideoSourceEditDialog from './VideoSourceEditDialog'
import SubscriptionSourceDialog from './SubscriptionSourceDialog'
import { URLSourceModal, TextSourceModal } from './ImportSourceModal'
import { SettingsSection } from '../common'
import { v4 as uuidv4 } from 'uuid'
import type { VideoApi } from '@/shared/types'
import type { VideoSource } from '@ouonnki/cms-core'

export default function VideoSource() {
  const {
    selectAllAPIs,
    deselectAllAPIs,
    videoAPIs,
    getSelectedAPIs,
    importVideoAPIs,
  } = useApiStore()

  // 全选逻辑
  const isAllSelected = videoAPIs.length > 0 && getSelectedAPIs().length === videoAPIs.length

  // 编辑弹窗状态
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<VideoApi | null>(null)

  // 订阅源详情弹窗状态
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [viewingSource, setViewingSource] = useState<VideoSource | null>(null)

  // 导入弹窗状态
  const [urlSourceModalOpen, setUrlSourceModalOpen] = useState(false)
  const [textSourceModalOpen, setTextSourceModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 添加视频源 — 打开空表单弹窗
  const handleAddSource = () => {
    setEditingSource({
      id: uuidv4(),
      name: '新增源',
      url: '',
      detailUrl: '',
      timeout: useSettingStore.getState().network.defaultTimeout || 3000,
      retry: useSettingStore.getState().network.defaultRetry || 3,
      isEnabled: true,
      updatedAt: new Date(),
    })
    setEditDialogOpen(true)
  }

  // 编辑/查看视频源
  const handleEditSource = (source: VideoSource) => {
    if (isSubscriptionSource(source.id)) {
      setViewingSource(source)
      setDetailDialogOpen(true)
    } else {
      setEditingSource(source as VideoApi)
      setEditDialogOpen(true)
    }
  }

  // 文件导入
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = e => {
      try {
        const content = e.target?.result as string
        const sources = JSON.parse(content)
        if (Array.isArray(sources)) {
          importVideoAPIs(sources)
          toast.success(`成功导入 ${sources.length} 个视频源`)
        } else {
          toast.error('导入失败：文件格式错误，应为数组格式')
        }
      } catch (error) {
        console.error('Import error:', error)
        toast.error('导入失败：JSON 解析错误')
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }

  // 导出为文件（排除订阅源）
  const handleExportToFile = () => {
    try {
      const manualAPIs = videoAPIs.filter(s => !isSubscriptionSource(s.id))
      const data = JSON.stringify(manualAPIs, null, 2)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ouonnki-tv-sources-${dayjs().format('YYYY-MM-DD')}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('导出成功')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('导出失败')
    }
  }

  // 导出为文本（排除订阅源）
  const handleExportToText = async () => {
    try {
      const manualAPIs = videoAPIs.filter(s => !isSubscriptionSource(s.id))
      const data = JSON.stringify(manualAPIs, null, 2)
      await navigator.clipboard.writeText(data)
      toast.success('已复制到剪贴板')
    } catch (error) {
      console.error('Copy error:', error)
      toast.error('复制失败，请手动复制')
    }
  }

  return (
    <>
      <VideoSourceEditDialog
        source={editingSource}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
      <SubscriptionSourceDialog
        source={viewingSource}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
      <URLSourceModal open={urlSourceModalOpen} onOpenChange={setUrlSourceModalOpen} />
      <TextSourceModal open={textSourceModalOpen} onOpenChange={setTextSourceModalOpen} />

      <SettingsSection
        title="视频源列表"
        description="在这里添加、编辑、导入、导出并控制视频源启用状态。"
        icon={<Database className="size-4" />}
        tone="sky"
        action={
          <div className="flex items-center gap-2">
            {videoAPIs.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3"
                onClick={() => (isAllSelected ? deselectAllAPIs() : selectAllAPIs())}
              >
                {isAllSelected ? (
                  <CircleX className="mr-1 size-3.5" />
                ) : (
                  <CircleCheckBig className="mr-1 size-3.5" />
                )}
                {isAllSelected ? '全部停用' : '全部启用'}
              </Button>
            )}
            <ActionDropdown
              label="添加源"
              items={[
                {
                  label: '手动添加',
                  onClick: handleAddSource,
                },
                {
                  label: '导入视频源',
                  type: 'sub',
                  children: [
                    {
                      label: '从文件导入',
                      onClick: () => fileInputRef.current?.click(),
                    },
                    {
                      label: '从URL导入',
                      onClick: () => setUrlSourceModalOpen(true),
                    },
                    {
                      label: '从文本导入',
                      onClick: () => setTextSourceModalOpen(true),
                    },
                  ],
                },
                {
                  label: '导出视频源',
                  type: 'sub',
                  children: [
                    {
                      label: '导出为文件',
                      onClick: handleExportToFile,
                    },
                    {
                      label: '导出为文本',
                      onClick: handleExportToText,
                    },
                  ],
                },
              ]}
            />
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="bg-sky-500/14 text-sky-700 dark:text-sky-300">
            已启用 {getSelectedAPIs().length}/{videoAPIs.length}
          </Badge>
          <Badge
            variant="outline"
            className="border-cyan-500/35 bg-cyan-500/8 text-cyan-700 dark:text-cyan-300"
          >
            支持文件 / URL / 文本导入
          </Badge>
        </div>

        {videoAPIs.length === 0 ? (
          <div className="text-muted-foreground flex h-20 items-center justify-center text-sm">
            暂无视频源，点击右上角「添加源」开始使用。
          </div>
        ) : (
          <div className="space-y-2">
            {videoAPIs.map(source => (
              <VideoSourceCard
                key={source.id}
                source={source}
                onEdit={() => handleEditSource(source)}
              />
            ))}
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".json"
          onChange={handleFileChange}
        />
      </SettingsSection>
    </>
  )
}
