import { Button } from '@/shared/components/ui/button'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { CircleX, CircleCheckBig, ChevronRight } from 'lucide-react'
import { Switch } from '@/shared/components/ui/switch'
import { cn } from '@/shared/lib'
import { useRef, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useApiStore } from '@/shared/store/apiStore'
import { useSettingStore } from '@/shared/store/settingStore'
import dayjs from 'dayjs'
import { Badge } from '@/shared/components/ui/badge'
import ActionDropdown from '@/shared/components/common/ActionDropdown'
import VideoSourceForm from './VideoSourceForm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import { v4 as uuidv4 } from 'uuid'
import { URLSourceModal, TextSourceModal } from './ImportSourceModal'
import { SettingsSection } from '../common'

export default function VideoSource() {
  // 视频源
  const {
    selectAllAPIs,
    deselectAllAPIs,
    videoAPIs,
    setApiEnabled,
    getSelectedAPIs,
    importVideoAPIs,
  } = useApiStore()
  // 用于显示的源列表
  const [showVideoAPIs, setShowVideoAPIs] = useState(videoAPIs)
  useEffect(() => {
    setShowVideoAPIs(videoAPIs)
  }, [videoAPIs])
  // 全选逻辑
  const isAllSelected = getSelectedAPIs().length === showVideoAPIs.length
  const handleToggleAll = () => {
    if (isAllSelected) {
      deselectAllAPIs()
    } else {
      selectAllAPIs()
    }
  }
  const [selectedIndex, setSelectedIndex] = useState(0)

  // 确保 selectedIndex 在有效范围内，防止删除最后一个元素时数组越界
  const safeIndex = Math.min(selectedIndex, Math.max(0, showVideoAPIs.length - 1))
  const selectedSource = showVideoAPIs[safeIndex]

  // 如果 selectedIndex 超出范围，更新它 (可选，为了状态一致性)
  useEffect(() => {
    if (selectedIndex !== safeIndex) {
      setSelectedIndex(safeIndex)
    }
  }, [selectedIndex, safeIndex])

  // 添加视频源
  const addVideoSource = () => {
    setShowVideoAPIs(prev => [
      {
        id: uuidv4(),
        name: '新增源',
        url: '',
        detailUrl: '',
        timeout: useSettingStore.getState().network.defaultTimeout || 3000,
        retry: useSettingStore.getState().network.defaultRetry || 3,
        isEnabled: true,
        updatedAt: new Date(),
      },
      ...prev,
    ])
    setSelectedIndex(0)
  }
  // 导入 input ref
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 从JSON文件导入视频源
  const addVideoSourceFromJSONFile = () => {
    fileInputRef.current?.click()
  }

  // 处理文件选择
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
      // 清空 input value，允许重复选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }

  // 处理从URL中导入
  const [urlSourceModalOpen, setUrlSourceModalOpen] = useState(false)
  const addVideoSourceFromURL = () => {
    setUrlSourceModalOpen(true)
  }

  // 处理从文本导入
  const [textSourceModalOpen, setTextSourceModalOpen] = useState(false)
  const addVideoSourceFromText = () => {
    setTextSourceModalOpen(true)
  }

  // 导出为文件
  const handleExportToFile = () => {
    try {
      const data = JSON.stringify(videoAPIs, null, 2)
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

  // 导出为文本
  const handleExportToText = async () => {
    try {
      const data = JSON.stringify(videoAPIs, null, 2)
      await navigator.clipboard.writeText(data)
      toast.success('已复制到剪贴板')
    } catch (error) {
      console.error('Copy error:', error)
      toast.error('复制失败，请手动复制')
    }
  }

  return (
    <>
      <URLSourceModal open={urlSourceModalOpen} onOpenChange={setUrlSourceModalOpen} />
      <TextSourceModal open={textSourceModalOpen} onOpenChange={setTextSourceModalOpen} />
      <SettingsSection
        title="视频源列表"
        description="在这里添加、编辑、导入、导出并控制视频源启用状态。"
        variant="flat"
        tone="sky"
        action={
          <ActionDropdown
            label="添加源"
            items={[
              {
                label: '手动添加',
                onClick: addVideoSource,
              },
              {
                label: '导入视频源',
                type: 'sub',
                children: [
                  {
                    label: '从文件导入',
                    onClick: addVideoSourceFromJSONFile,
                  },
                  {
                    label: '从URL导入',
                    onClick: addVideoSourceFromURL,
                  },
                  {
                    label: '从文本导入',
                    onClick: addVideoSourceFromText,
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
        }
      >
        <div className="mb-2 flex flex-wrap items-center gap-2">
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

        <div className="flex flex-col gap-4 md:flex-row">
          {/* Desktop: Sidebar List */}
          <div className="bg-card/70 hidden w-64 flex-col rounded-xl p-3 md:flex md:self-stretch">
            <div className="flex items-center justify-between px-1 py-2">
              <p className="text-muted-foreground text-sm">源列表 ({showVideoAPIs.length})</p>
              <Button
                onClick={handleToggleAll}
                variant="ghost"
                size="sm"
                disabled={showVideoAPIs.length === 0}
              >
                {isAllSelected ? <CircleX /> : <CircleCheckBig />}
                {isAllSelected ? '全部停用' : '全部启用'}
              </Button>
            </div>
            <ScrollArea className="border-border flex-1 border-t py-3 pr-2">
              <div className="flex flex-col gap-2">
                {showVideoAPIs.length === 0 && (
                  <div className="text-muted-foreground flex h-24 items-center justify-center text-sm">
                    <p>暂无视频源</p>
                  </div>
                )}
                {showVideoAPIs.map((source, index) => (
                  <div
                    className={cn(
                      'hover:bg-accent flex h-10 items-center justify-between rounded-md px-3 text-sm transition-colors',
                      selectedSource?.id === source.id ? 'bg-accent text-accent-foreground' : '',
                    )}
                    key={source.id}
                    onClick={() => setSelectedIndex(index)}
                  >
                    <p>{source.name}</p>
                    <Switch
                      onClick={e => e.stopPropagation()}
                      onCheckedChange={() => setApiEnabled(source.id, !source.isEnabled)}
                      checked={source.isEnabled}
                    ></Switch>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="bg-card/70 flex flex-1 flex-col rounded-xl p-4">
            {selectedSource ? (
              <>
                <div className="border-border flex items-center justify-between border-b pb-3">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-semibold">{selectedSource.name}</h3>
                    <p className="text-muted-foreground text-xs">
                      最后更新时间：
                      {dayjs(selectedSource.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
                    </p>
                  </div>
                  {/* Mobile: Source Switcher Button */}
                  <div className="md:hidden">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          切换视频源
                          <ChevronRight />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>选择视频源</DialogTitle>
                        </DialogHeader>
                        <div className="flex items-center justify-between py-2">
                          <p className="text-muted-foreground text-sm">
                            已启用 {getSelectedAPIs().length}/{videoAPIs.length}
                          </p>
                          <Button
                            onClick={handleToggleAll}
                            variant="ghost"
                            size="sm"
                            disabled={showVideoAPIs.length === 0}
                          >
                            {isAllSelected ? '全部停用' : '全部启用'}
                          </Button>
                        </div>
                        <ScrollArea className="h-[24rem] rounded-md pr-2">
                          <div className="flex flex-col gap-2 rounded-md">
                            {showVideoAPIs.map((source, index) => (
                              <div
                                className={cn(
                                  'flex h-12 items-center justify-between rounded-md border border-transparent px-4 py-2 text-sm transition-colors hover:cursor-pointer',
                                  selectedSource?.id === source.id
                                    ? 'border-border bg-accent'
                                    : 'hover:bg-accent/60',
                                )}
                                key={source.id}
                                onClick={() => setSelectedIndex(index)}
                              >
                                <p
                                  className={cn(
                                    'font-medium',
                                    selectedSource?.id === source.id ? 'text-primary' : '',
                                  )}
                                >
                                  {source.name}
                                </p>
                                <Switch
                                  onClick={e => e.stopPropagation()}
                                  onCheckedChange={() =>
                                    setApiEnabled(source.id, !source.isEnabled)
                                  }
                                  checked={source.isEnabled}
                                />
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div className="mt-3">
                  <VideoSourceForm sourceInfo={selectedSource} />
                </div>
              </>
            ) : (
              <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
                请选择或点击右上角添加视频源
              </div>
            )}
          </div>
        </div>
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
