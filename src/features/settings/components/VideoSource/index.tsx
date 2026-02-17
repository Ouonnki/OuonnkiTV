import { Button } from '@/shared/components/ui/button'
import {
  CircleX,
  CircleCheckBig,
  Database,
  Activity,
  ArrowUpDown,
  Loader2,
  GripVertical,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useApiStore } from '@/shared/store/apiStore'
import { useHealthStore } from '@/shared/store/healthStore'
import { isSubscriptionSource } from '@/shared/store/subscriptionStore'
import { useSettingStore } from '@/shared/store/settingStore'
import { batchCheckVideoSources } from '@/shared/lib/health-check'
import dayjs from 'dayjs'
import { Badge } from '@/shared/components/ui/badge'
import ActionDropdown from '@/shared/components/common/ActionDropdown'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import SortableVideoSourceCard from './SortableVideoSourceCard'
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
    reorderVideoAPIs,
  } = useApiStore()

  const { results } = useHealthStore()
  const hasResults = Object.keys(results).length > 0

  // 本地测速状态（不影响其他组件）
  const [isTesting, setIsTesting] = useState(false)
  const [testProgress, setTestProgress] = useState({ completed: 0, total: 0 })

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

  // 拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // 拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = videoAPIs.findIndex(s => s.id === active.id)
    const newIndex = videoAPIs.findIndex(s => s.id === over.id as string)
    if (oldIndex === -1 || newIndex === -1) return

    const newOrder = [...videoAPIs]
    const [moved] = newOrder.splice(oldIndex, 1)
    newOrder.splice(newIndex, 0, moved)
    reorderVideoAPIs(newOrder.map(s => s.id))
  }

  // 批量测速
  const handleBatchTest = async () => {
    setIsTesting(true)
    setTestProgress({ completed: 0, total: videoAPIs.length })
    await batchCheckVideoSources(videoAPIs, (completed, total) => {
      setTestProgress({ completed, total })
    })
    setIsTesting(false)
  }

  // 按延迟排序
  const handleSortByLatency = () => {
    const healthResults = useHealthStore.getState().results
    const statusPriority = (id: string) => {
      const s = healthResults[id]?.status
      if (s === 'online') return 0
      if (s === 'timeout') return 1
      if (s === 'offline' || s === 'error') return 2
      return 3
    }
    const sortedIds = [...videoAPIs]
      .sort((a, b) => {
        const pa = statusPriority(a.id)
        const pb = statusPriority(b.id)
        if (pa !== pb) return pa - pb
        const la = healthResults[a.id]?.latency ?? Infinity
        const lb = healthResults[b.id]?.latency ?? Infinity
        return la - lb
      })
      .map(s => s.id)
    reorderVideoAPIs(sortedIds)
  }

  // 添加视频源
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
          <div className="flex flex-wrap items-center gap-2">
            {videoAPIs.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3"
                onClick={handleBatchTest}
                disabled={isTesting}
              >
                {isTesting ? (
                  <Loader2 className="mr-1 size-3.5 animate-spin" />
                ) : (
                  <Activity className="mr-1 size-3.5" />
                )}
                {isTesting
                  ? `${testProgress.completed}/${testProgress.total}`
                  : '测速'}
              </Button>
            )}
            {videoAPIs.length > 0 && hasResults && !isTesting && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3"
                onClick={handleSortByLatency}
              >
                <ArrowUpDown className="mr-1 size-3.5" />
                按延迟排序
              </Button>
            )}
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
        {videoAPIs.length === 0 ? (
          <div className="text-muted-foreground flex h-20 items-center justify-center text-sm">
            暂无视频源，点击右上角「添加源」开始使用。
          </div>
        ) : (
          <>
            {/* 已启用统计 + 拖拽排序提示 */}
            <div className="flex items-center justify-between gap-2">
              <Badge variant="secondary" className="bg-sky-500/14 text-sky-700 dark:text-sky-300">
                已启用 {getSelectedAPIs().length}/{videoAPIs.length}
              </Badge>
              <div className="text-muted-foreground/60 flex items-center gap-1.5 text-xs">
                <GripVertical className="size-3" />
                <span>拖拽左侧手柄可调整顺序</span>
              </div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={videoAPIs.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {videoAPIs.map(source => (
                    <SortableVideoSourceCard
                      key={source.id}
                      source={source}
                      onEdit={() => handleEditSource(source)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </>
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
