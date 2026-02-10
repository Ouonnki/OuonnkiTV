import { Skeleton } from '@/shared/components/ui/skeleton'

/**
 * FilterSkeleton - 筛选骨架屏组件
 * 匹配实际筛选布局：类型3个、地区7个+更多按钮、展开按钮
 */
export function FilterSkeleton() {
  return (
    <div className="space-y-3">
      {/* 类型行 - 3个标签（全部/电影/剧集） */}
      <div className="flex gap-3">
        <Skeleton className="h-6 w-12 shrink-0" />
        <div className="flex flex-1 flex-wrap gap-2">
          <Skeleton className="h-8 w-12 rounded-full" />
          <Skeleton className="h-8 w-12 rounded-full" />
          <Skeleton className="h-8 w-12 rounded-full" />
        </div>
      </div>
      {/* 地区行 - 1个全部 + 6个常用 + 更多按钮 */}
      <div className="flex gap-3">
        <Skeleton className="h-6 w-12 shrink-0" />
        <div className="flex flex-1 flex-wrap gap-2">
          <Skeleton className="h-8 w-12 rounded-full" />
          <Skeleton className="h-8 w-12 rounded-full" />
          <Skeleton className="h-8 w-12 rounded-full" />
          <Skeleton className="h-8 w-12 rounded-full" />
          <Skeleton className="h-8 w-12 rounded-full" />
          <Skeleton className="h-8 w-12 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      </div>
      {/* 展开/收起按钮骨架 */}
      <div className="flex justify-center pt-1">
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  )
}
