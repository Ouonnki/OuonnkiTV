import { useApiStore } from '@/shared/store/apiStore'
import { useCmsVideoList } from '@/shared/hooks/useCmsCore'
import type { VideoSource } from '@ouonnki/cms-core'
import { ContinueWatching } from './ContinueWatching'
import { CmsMediaCarousel } from './CmsMediaCarousel'
import { NavLink } from 'react-router'
import { Settings, Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

/**
 * 单个视频源推荐列表
 * 独立组件以隔离每个源的 hook 调用
 */
function SourceCarousel({ source }: { source: VideoSource }) {
  const { items, loading } = useCmsVideoList(source)

  return (
    <CmsMediaCarousel
      title={source.name}
      items={items}
      loading={loading}
    />
  )
}

/**
 * 无视频源时的空状态
 */
function EmptySourceState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="bg-muted flex size-16 items-center justify-center rounded-full">
        <Settings className="text-muted-foreground size-8" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold">暂无视频源</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          添加视频源后即可浏览推荐内容
        </p>
      </div>
      <Button asChild variant="outline">
        <NavLink to="/settings/source">
          <Plus className="size-4" />
          添加视频源
        </NavLink>
      </Button>
    </div>
  )
}

/**
 * CmsHomeContent - CMS 模式首页内容
 * 当 TMDB 未启用时作为首页内容展示
 */
export function CmsHomeContent() {
  const videoAPIs = useApiStore(state => state.videoAPIs)

  return (
    <div className="flex flex-col gap-6">
      {/* 继续观看 */}
      <ContinueWatching />
      {/* 各视频源推荐列表 */}
      {videoAPIs.length > 0 ? (
        videoAPIs.map(source => (
          <SourceCarousel key={source.id} source={source} />
        ))
      ) : (
        <EmptySourceState />
      )}
    </div>
  )
}
