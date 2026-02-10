import { Play } from 'lucide-react'
import { NavLink } from 'react-router'
import { AspectRatio } from '@/shared/components/ui/aspect-ratio'
import type { SourceColorScheme } from '@/shared/lib/source-colors'

interface MediaPosterCardProps {
  /** 链接地址 */
  to: string
  /** 海报图片 URL */
  posterUrl?: string | null
  /** 标题 */
  title: string
  /** 海报比例，默认 2/3 */
  aspectRatio?: number
  /** 是否显示标题，默认 true */
  showTitle?: boolean
  /** 年份 - 显示在左上角 */
  year?: string | number
  /** 右上角标签 */
  topRightLabel?: string
  /** 右上角标签配色方案（不传则使用默认黄色） */
  topRightLabelColorScheme?: SourceColorScheme
  /** 评分 (0-10) - 显示在右下角 */
  rating?: number
}

/**
 * MediaPosterCard - 媒体海报卡片组件
 * 通用的海报卡片，支持海报显示、hover 效果、播放按钮遮罩
 */
export function MediaPosterCard({
  to,
  posterUrl,
  title,
  aspectRatio = 2 / 3,
  showTitle = true,
  year,
  topRightLabel,
  topRightLabelColorScheme,
  rating,
}: MediaPosterCardProps) {
  // 使用自定义配色或默认配色
  const labelColor = topRightLabelColorScheme || { bg: '250, 204, 21', text: '120, 53, 15' } // yellow-400 和 amber-950 的 RGB 值

  // 计算样式
  const labelStyle = {
    backgroundColor: `rgb(${labelColor.bg})`,
    color: `rgb(${labelColor.text})`,
  }
  return (
    <NavLink to={to}>
      <div className="group cursor-pointer">
        {/* 海报卡片 */}
        <div className="relative overflow-hidden rounded-lg">
          <AspectRatio ratio={aspectRatio}>
            {posterUrl ? (
              <img
                className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                src={posterUrl}
                alt={title}
                loading="lazy"
              />
            ) : (
              <div className="bg-muted flex h-full w-full items-center justify-center">
                <span className="text-muted-foreground text-sm">No Image</span>
              </div>
            )}
            
            {/* 上下遮罩 - 增强文字可读性 */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent transition-opacity duration-300 group-hover:opacity-0" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 group-hover:opacity-0" />

            {/* 信息徽标 */}
            {year && (
              <div className="absolute left-1 top-1 rounded px-1.5 py-0.5 text-[10px] items-center font-medium text-white/90 transition-opacity duration-300 group-hover:opacity-0">
                {year}
              </div>
            )}

            {topRightLabel && (
              <div
                className="absolute right-0 top-0 rounded-bl-md rounded-tr-lg px-2 py-0.5 text-[10px] font-medium shadow-sm transition-opacity duration-300 group-hover:opacity-0"
                style={labelStyle}
              >
                {topRightLabel}
              </div>
            )}

            {rating !== undefined && rating > 0 && (
              <div className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold text-yellow-400 transition-opacity duration-300 group-hover:opacity-0">
                <span>★</span>
                <span>{rating.toFixed(1)}</span>
              </div>
            )}
          </AspectRatio>
          {/* Hover 全卡片遮罩 + 播放按钮 */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex size-12 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
              <Play className="size-6 fill-current" />
            </div>
          </div>
        </div>
        {/* 标题 - 卡片下方 */}
        {showTitle && (
          <div className="mt-2 px-0.5">
            <p className="text-primary line-clamp-1 text-sm font-medium">{title}</p>
          </div>
        )}
      </div>
    </NavLink>
  )
}
