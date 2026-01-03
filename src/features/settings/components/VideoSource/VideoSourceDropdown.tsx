import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
// DropdownMenu

export default function VideoSourceDropdown({
  addVideoSource,
  addVideoSourceFromJSONFile,
  addVideoSourceFromURL,
  addVideoSourceFromText,
  onExportToFile,
  onExportToText,
}: {
  addVideoSource: () => void
  addVideoSourceFromJSONFile: () => void
  addVideoSourceFromURL: () => void
  addVideoSourceFromText: () => void
  onExportToFile: () => void
  onExportToText: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-white/40 backdrop-blur-xl hover:bg-gray-100/50">
          添加源 <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40 bg-white/10 backdrop-blur-lg" align="end">
        <DropdownMenuItem className="px-2 hover:cursor-pointer" onClick={addVideoSource}>
          手动添加
        </DropdownMenuItem>
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="px-2">导入视频源</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="bg-white/10 backdrop-blur-lg">
                <DropdownMenuItem
                  className="hover:cursor-pointer"
                  onClick={addVideoSourceFromJSONFile}
                >
                  从文件导入
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:cursor-pointer" onClick={addVideoSourceFromURL}>
                  从URL导入
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:cursor-pointer" onClick={addVideoSourceFromText}>
                  从文本导入
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="px-2">导出视频源</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="bg-white/10 backdrop-blur-lg">
                <DropdownMenuItem className="hover:cursor-pointer" onClick={onExportToFile}>
                  导出为文件
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:cursor-pointer" onClick={onExportToText}>
                  导出为文本
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
