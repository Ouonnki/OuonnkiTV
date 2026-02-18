import dayjs from 'dayjs'
import { getHistoryItemKey as getSharedHistoryItemKey } from '@/shared/lib/viewingHistory'
import type { ViewingHistoryItem } from '@/shared/types'

export type HistorySectionKey = 'today' | 'yesterday' | 'older'

export const HISTORY_SECTION_ORDER: HistorySectionKey[] = ['today', 'yesterday', 'older']

export const HISTORY_SECTION_LABEL_MAP: Record<HistorySectionKey, string> = {
  today: '今天',
  yesterday: '昨天',
  older: '更早',
}

export const HISTORY_SECTION_BADGE_CLASS_MAP: Record<HistorySectionKey, string> = {
  today: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  yesterday: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  older: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
}

export const getHistoryItemKey = (item: ViewingHistoryItem) => getSharedHistoryItemKey(item)

export const getHistorySectionKey = (timestamp: number): HistorySectionKey => {
  const target = dayjs(timestamp)
  const todayStart = dayjs().startOf('day')
  const yesterdayStart = dayjs().subtract(1, 'day').startOf('day')

  if (target.isAfter(todayStart) || target.isSame(todayStart)) return 'today'
  if (target.isAfter(yesterdayStart) || target.isSame(yesterdayStart)) return 'yesterday'
  return 'older'
}

export const groupHistoryBySection = (sortedHistory: ViewingHistoryItem[]) => {
  const groups: Record<HistorySectionKey, ViewingHistoryItem[]> = {
    today: [],
    yesterday: [],
    older: [],
  }

  sortedHistory.forEach(item => {
    groups[getHistorySectionKey(item.timestamp)].push(item)
  })

  return groups
}
