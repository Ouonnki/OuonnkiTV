import { Sparkles, Wrench, Zap } from 'lucide-react'

/** 版本更新分类键 */
export type CategoryKey = 'features' | 'fixes' | 'breaking'

/** 分类配置 */
export const CATEGORY_CONFIG = {
  features: {
    title: '新功能',
    icon: Sparkles,
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  fixes: {
    title: '问题修复',
    icon: Wrench,
    text: 'text-amber-700 dark:text-amber-300',
  },
  breaking: {
    title: '重要变更',
    icon: Zap,
    text: 'text-rose-700 dark:text-rose-300',
  },
} as const
