import { Button } from '@/shared/components/ui/button'
import {
  CircleX,
  CircleCheckBig,
  Database,
  Activity,
  ArrowUpDown,
  Loader2,
  GripVertical,
  Plus,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useApiStore } from '@/shared/store/apiStore'
import { useHealthStore } from '@/shared/store/healthStore'
import { isSubscriptionSource } from '@/shared/store/subscriptionStore'
import { useSettingStore } from '@/shared/store/settingStore'
import { batchCheckVideoSources } from '@/shared/lib/health-check'
import dayjs from 'dayjs'
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
    const newIndex = videoAPIs.findIndex(s => s.id === (over.id as string))
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
      retry: useSettingStore.getState().network.defaultRetry,
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
        description={
          videoAPIs.length > 0
            ? `共 ${videoAPIs.length} 个视频源，已启用 ${getSelectedAPIs().length} 个。`
            : '手动添加，或从文件、链接和文本批量导入。'
        }
        icon={<Database className="size-4" />}
        layout="stack"
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
                {isTesting ? `${testProgress.completed}/${testProgress.total}` : '测速'}
              </Button>
            )}
            {videoAPIs.length > 0 && hasResults && !isTesting && (
              <Button variant="ghost" size="sm" className="h-8 px-3" onClick={handleSortByLatency}>
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
              label="导入 / 导出"
              buttonSize="sm"
              items={[
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
            <Button size="sm" onClick={handleAddSource}>
              <Plus className="size-4" />
              添加视频源
            </Button>
          </div>
        }
      >
        {videoAPIs.length === 0 ? (
          <div className="border-border/80 flex flex-col items-center rounded-xl border border-dashed px-4 py-10 text-center">
            <Database aria-hidden="true" className="text-muted-foreground/50 mb-3 size-8" />
            <p className="text-sm font-medium">还没有视频源</p>
            <p className="text-muted-foreground mt-2 max-w-sm text-xs leading-5">
              添加一个视频源开始搜索，也可以在下方订阅远程源列表。
            </p>
            <Button variant="outline" size="sm" className="mt-5" onClick={handleAddSource}>
              <Plus className="size-4" />
              添加第一个源
            </Button>
          </div>
        ) : (
          <>
            {/* 已启用统计 + 拖拽排序提示 */}
            <div className="mb-3 flex items-center gap-2">
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <GripVertical className="size-3" />
                <span>拖动手柄调整顺序，也可聚焦手柄后按空格及方向键排序</span>
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
                <div className="border-border bg-background/40 overflow-hidden rounded-xl border">
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
