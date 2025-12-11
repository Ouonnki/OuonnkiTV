import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CircleX, CircleCheckBig } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/utils'
import { useRef, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useApiStore } from '@/store/apiStore'
import dayjs from 'dayjs'
import VideoSourceForm from './VideoSourceForm'
import VideoSourceDropdown from './VideoSourceDropdown'
import { v4 as uuidv4 } from 'uuid'
import { URLSourceModal, TextSourceModal } from './ImportSourceModal'

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
    setShowVideoAPIs([
      ...showVideoAPIs,
      {
        id: uuidv4(),
        name: '新增源',
        url: '',
        detailUrl: '',
        timeout: 3000,
        retry: 3,
        isEnabled: true,
        updatedAt: new Date(),
      },
    ])
    setSelectedIndex(showVideoAPIs.length)
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
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <div className="pl-2">
            <h1 className="text-md font-semibold text-gray-700">视频源列表</h1>
            <p className="text-xs text-gray-400">
              您可以在下列视频源中添加、删除、编辑和启用视频源
            </p>
          </div>
          <VideoSourceDropdown
            addVideoSource={addVideoSource}
            addVideoSourceFromJSONFile={addVideoSourceFromJSONFile}
            addVideoSourceFromURL={addVideoSourceFromURL}
            addVideoSourceFromText={addVideoSourceFromText}
            onExportToFile={handleExportToFile}
            onExportToText={handleExportToText}
          />
        </div>
        <div className="flex border-t border-gray-300/40">
          <div className="flex w-60 flex-col">
            <div className="flex items-center justify-between px-4 py-2">
              <p className="text-sm text-gray-500">
                已启用 {getSelectedAPIs().length}/{videoAPIs.length}
              </p>
              <Button
                onClick={handleToggleAll}
                variant="ghost"
                disabled={showVideoAPIs.length === 0}
                className="hover:bg-white/40 hover:backdrop-blur-xl"
              >
                {isAllSelected ? <CircleX /> : <CircleCheckBig />}
                {isAllSelected ? '全部停用' : '全部启用'}
              </Button>
            </div>
            <ScrollArea className="border-t border-gray-300/40 py-4 pr-3">
              <div className="flex max-h-155 flex-col gap-2 text-gray-700">
                {showVideoAPIs.length === 0 && (
                  <div className="flex h-full items-center justify-center">
                    <p>暂无视频源</p>
                  </div>
                )}
                {showVideoAPIs.map((source, index) => (
                  <div
                    className={cn(
                      'flex h-10 items-center justify-between rounded-md p-4 hover:cursor-pointer hover:bg-white/20 hover:backdrop-blur-xl',
                      selectedSource?.id === source.id ? 'bg-white/40 backdrop-blur-xl' : '',
                    )}
                    key={source.id}
                    onClick={() => setSelectedIndex(index)}
                  >
                    <p>{source.name}</p>
                    <Switch
                      onCheckedChange={() => setApiEnabled(source.id, !source.isEnabled)}
                      checked={source.isEnabled}
                    ></Switch>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="h-fit flex-1 border-l border-gray-300/40 p-4 backdrop-blur-xl">
            {selectedSource ? (
              <>
                <div className="flex items-center justify-between border-b border-gray-300/40 pb-2">
                  <h1 className="text-xl font-semibold text-gray-800">{selectedSource.name}</h1>
                  <p className="text-xs text-gray-500">
                    最后更新时间：
                    {dayjs(selectedSource.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
                  </p>
                </div>
                <VideoSourceForm sourceInfo={selectedSource} />
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
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
      </div>
    </>
  )
}
