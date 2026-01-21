import { motion } from 'framer-motion'
import { Sparkles, Zap } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export type SearchMode = 'tmdb' | 'direct'

interface SearchModeToggleProps {
  mode: SearchMode
  onChange: (mode: SearchMode) => void
  className?: string
}

/**
 * SearchModeToggle - 搜索模式切换组件
 * 用于在智能检索（TMDB）和直连搜索之间切换
 */
export function SearchModeToggle({ mode, onChange, className }: SearchModeToggleProps) {
  const modes: { value: SearchMode; label: string; icon: typeof Sparkles }[] = [
    { value: 'tmdb', label: '智能检索', icon: Sparkles },
    { value: 'direct', label: '直连搜索', icon: Zap },
  ]

  return (
    <div
      className={cn(
        'bg-muted relative inline-flex items-center rounded-full p-1',
        className,
      )}
    >
      {modes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={cn(
            'relative z-10 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
            mode === value
              ? 'text-primary'
              : 'text-muted-foreground hover:text-primary/80',
          )}
        >
          <Icon className="size-4" />
          <span>{label}</span>
          {mode === value && (
            <motion.div
              layoutId="search-mode-indicator"
              className="bg-background absolute inset-0 -z-10 rounded-full shadow-sm"
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
              }}
            />
          )}
        </button>
      ))}
    </div>
  )
}
