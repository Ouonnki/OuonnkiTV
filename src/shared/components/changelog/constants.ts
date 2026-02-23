import { Sparkles, Wrench, Zap } from 'lucide-react'

/** 版本更新分类键 */
export type CategoryKey = 'features' | 'fixes' | 'breaking'

/** 分类配置 */
export const CATEGORY_CONFIG = {
  features: {
    title: '新功能',
    icon: Sparkles,
    line: 'from-emerald-500/30 to-transparent',
    text: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  fixes: {
    title: '问题修复',
    icon: Wrench,
    line: 'from-amber-500/32 to-transparent',
    text: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  breaking: {
    title: '重要变更',
    icon: Zap,
    line: 'from-rose-500/30 to-transparent',
    text: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
} as const
