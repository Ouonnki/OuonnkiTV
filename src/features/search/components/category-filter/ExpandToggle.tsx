import { ChevronDown } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface ExpandToggleProps {
  /** 是否展开 */
  isExpanded: boolean
  /** 切换展开状态 */
  onToggle: () => void
  className?: string
}

/**
 * 展开/收起按钮组件
 */
export function ExpandToggle({ isExpanded, onToggle, className }: ExpandToggleProps) {
  return (
    <div className={cn('flex justify-center pt-1', className)}>
      <button
        type="button"
        onClick={onToggle}
        className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm transition-colors"
      >
        <span>{isExpanded ? '收起' : '展开更多'}</span>
        <ChevronDown className={cn('size-4 transition-transform', isExpanded && 'rotate-180')} />
      </button>
    </div>
  )
}
