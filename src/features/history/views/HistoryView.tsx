import { useCallback, useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { AnimatePresence, motion } from 'framer-motion'
import { History, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ViewingHistoryCard } from '@/shared/components/common'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/shared/components/ui/context-menu'
import { useViewingHistoryStore } from '@/shared/store'
import type { ViewingHistoryItem } from '@/shared/types'

type HistorySectionKey = 'today' | 'yesterday' | 'older'

const sectionOrder: HistorySectionKey[] = ['today', 'yesterday', 'older']

const sectionLabelMap: Record<HistorySectionKey, string> = {
  today: '今天',
  yesterday: '昨天',
  older: '更早',
}

const sectionBadgeClassMap: Record<HistorySectionKey, string> = {
  today: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  yesterday: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  older: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
}

const getHistoryItemKey = (item: ViewingHistoryItem) =>
  `${item.sourceCode}::${item.vodId}::${item.episodeIndex}`

const getDeleteTargetKey = (item: ViewingHistoryItem) => `${item.sourceCode}::${item.vodId}`

const getSectionKey = (timestamp: number): HistorySectionKey => {
  const target = dayjs(timestamp)
  const todayStart = dayjs().startOf('day')
  const yesterdayStart = dayjs().subtract(1, 'day').startOf('day')

  if (target.isAfter(todayStart) || target.isSame(todayStart)) return 'today'
  if (target.isAfter(yesterdayStart) || target.isSame(yesterdayStart)) return 'yesterday'
  return 'older'
}

const actionTransitionVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 24 : -24,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -24 : 24,
  }),
}

/**
 * HistoryView - 观看历史页面
 * 支持时间轴分区、批量删除、右键删除以及移动端/平板响应式布局
 */
export default function HistoryView() {
  const { viewingHistory, removeViewingHistory, clearViewingHistory } = useViewingHistoryStore()

  const [selectionMode, setSelectionMode] = useState(false)
  const [actionDirection, setActionDirection] = useState(1)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [pendingDeleteItem, setPendingDeleteItem] = useState<ViewingHistoryItem | null>(null)
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false)
  const [clearAllOpen, setClearAllOpen] = useState(false)

  const sortedHistory = useMemo(() => {
    return [...viewingHistory].sort((a, b) => b.timestamp - a.timestamp)
  }, [viewingHistory])
  const hasHistory = sortedHistory.length > 0

  const allItemKeys = useMemo(() => {
    return sortedHistory.map(getHistoryItemKey)
  }, [sortedHistory])

  const itemMap = useMemo(() => {
    return new Map(sortedHistory.map(item => [getHistoryItemKey(item), item]))
  }, [sortedHistory])

  const sectionedHistory = useMemo(() => {
    const groups: Record<HistorySectionKey, ViewingHistoryItem[]> = {
      today: [],
      yesterday: [],
      older: [],
    }

    sortedHistory.forEach(item => {
      groups[getSectionKey(item.timestamp)].push(item)
    })

    return groups
  }, [sortedHistory])

  useEffect(() => {
    const validSet = new Set(allItemKeys)
    setSelectedKeys(previous => {
      const next = new Set([...previous].filter(key => validSet.has(key)))
      return next.size === previous.size ? previous : next
    })
  }, [allItemKeys])

  const isAllSelected = sortedHistory.length > 0 && selectedKeys.size === sortedHistory.length

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(previous => {
      const next = !previous
      setActionDirection(next ? 1 : -1)
      if (!next) setSelectedKeys(new Set())
      return next
    })
  }, [])

  const toggleItemSelected = useCallback((item: ViewingHistoryItem) => {
    const itemKey = getHistoryItemKey(item)
    setSelectedKeys(previous => {
      const next = new Set(previous)
      if (next.has(itemKey)) {
        next.delete(itemKey)
      } else {
        next.add(itemKey)
      }
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedKeys(new Set(allItemKeys))
  }, [allItemKeys])

  const handleDeselectAll = useCallback(() => {
    setSelectedKeys(new Set())
  }, [])

  const handleDeleteSingle = useCallback(
    (item: ViewingHistoryItem) => {
      removeViewingHistory(item)
      setSelectedKeys(previous => {
        const next = new Set(previous)
        next.delete(getHistoryItemKey(item))
        return next
      })
      toast.success('已删除历史记录')
    },
    [removeViewingHistory],
  )

  const handleDeleteSelected = useCallback(() => {
    const deleteTargets = new Map<string, ViewingHistoryItem>()

    selectedKeys.forEach(itemKey => {
      const item = itemMap.get(itemKey)
      if (!item) return
      deleteTargets.set(getDeleteTargetKey(item), item)
    })

    deleteTargets.forEach(item => {
      removeViewingHistory(item)
    })

    setSelectedKeys(new Set())
    setSelectionMode(false)
    setBatchDeleteOpen(false)
    toast.success(`已删除 ${deleteTargets.size} 条历史记录`)
  }, [itemMap, removeViewingHistory, selectedKeys])

  const handleClearAll = useCallback(() => {
    clearViewingHistory()
    setSelectedKeys(new Set())
    setSelectionMode(false)
    setClearAllOpen(false)
    toast.success('已清空全部历史记录')
  }, [clearViewingHistory])

  const actionButtonClass = 'shrink-0 rounded-xl px-2 md:h-8 md:px-3 md:text-sm'

  const renderEditingActions = () => (
    <div className="flex shrink-0 items-center gap-1">
      <Button
        variant="outline"
        size="xs"
        className={actionButtonClass}
        onClick={isAllSelected ? handleDeselectAll : handleSelectAll}
      >
        {isAllSelected ? '取消' : '全选'}
      </Button>

      <Button
        variant="destructive"
        size="xs"
        className={actionButtonClass}
        disabled={selectedKeys.size === 0}
        onClick={() => setBatchDeleteOpen(true)}
      >
        删除({selectedKeys.size})
      </Button>

      <Button variant="ghost" size="xs" className={actionButtonClass} onClick={toggleSelectionMode}>
        完成
      </Button>
    </div>
  )

  const renderDefaultActions = () => (
    <div className="flex shrink-0 items-center gap-1">
      <Button
        variant="outline"
        size="xs"
        className={actionButtonClass}
        onClick={toggleSelectionMode}
      >
        编辑
      </Button>
      <Button
        variant="ghost"
        size="xs"
        className="text-destructive hover:text-destructive hover:bg-transparent dark:hover:bg-transparent shrink-0 rounded-xl px-2 md:px-3"
        disabled={!hasHistory}
        onClick={() => setClearAllOpen(true)}
      >
        清空
      </Button>
    </div>
  )

  return (
    <div className="min-h-full">
      <header className="border-border bg-sidebar/80 sticky top-0 z-20 border-b backdrop-blur-md">
        <div className="flex h-14 items-center gap-2 px-4">
          <div className="flex min-w-0 shrink items-center gap-2">
            <h1 className="shrink-0 text-base font-bold md:text-lg">观看历史</h1>
            <span className="text-muted-foreground hidden shrink-0 text-xs sm:inline md:text-sm">
              共 <span className="text-primary font-medium">{sortedHistory.length}</span> 项
            </span>
          </div>

          <div className="ml-auto relative shrink-0">
            <div className="invisible pointer-events-none" aria-hidden>
              {renderEditingActions()}
            </div>

            <AnimatePresence mode="sync" initial={false} custom={actionDirection}>
              {selectionMode ? (
                <motion.div
                  key="editing-actions"
                  custom={actionDirection}
                  variants={actionTransitionVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute inset-y-0 right-0 flex items-center"
                >
                  {renderEditingActions()}
                </motion.div>
              ) : (
                <motion.div
                  key="default-actions"
                  custom={actionDirection}
                  variants={actionTransitionVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute inset-y-0 right-0 flex items-center"
                >
                  {renderDefaultActions()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="relative px-4 py-6">
        {hasHistory && (
          <div className="bg-border pointer-events-none absolute top-6 bottom-0 left-6 w-px" />
        )}

        {!hasHistory ? (
          <div className="flex flex-col items-center justify-center py-28">
            <History className="text-muted-foreground/30 size-24" />
            <p className="text-muted-foreground mt-4 text-sm">暂无观看历史</p>
          </div>
        ) : (
          <div className="relative space-y-8 pb-6">
            {sectionOrder.map(sectionKey => {
              const sectionItems = sectionedHistory[sectionKey]
              if (sectionItems.length === 0) return null

              return (
                <section key={sectionKey} className="relative pl-6">
                  <div className="bg-primary absolute top-1.5 left-[5px] size-[6px] rounded-full" />

                  <div className="mb-4 flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={sectionBadgeClassMap[sectionKey]}
                    >
                      {sectionLabelMap[sectionKey]}
                    </Badge>
                    <span className="text-muted-foreground text-sm">{sectionItems.length} 项</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {sectionItems.map(item => {
                      const itemKey = getHistoryItemKey(item)
                      const selected = selectedKeys.has(itemKey)

                      return (
                        <ContextMenu key={itemKey}>
                          <ContextMenuTrigger asChild>
                            <div>
                              <ViewingHistoryCard
                                item={item}
                                selectionMode={selectionMode}
                                selected={selected}
                                onToggleSelect={toggleItemSelected}
                              />
                            </div>
                          </ContextMenuTrigger>

                          <ContextMenuContent>
                            <ContextMenuItem
                              onClick={() => {
                                if (!selectionMode) {
                                  setSelectionMode(true)
                                }
                                toggleItemSelected(item)
                              }}
                            >
                              {selected ? '取消选中' : '选中此项'}
                            </ContextMenuItem>

                            <ContextMenuSeparator />

                            <ContextMenuItem
                              variant="destructive"
                              onClick={() => setPendingDeleteItem(item)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              删除记录
                            </ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </main>

      <AlertDialog
        open={pendingDeleteItem !== null}
        onOpenChange={open => {
          if (!open) setPendingDeleteItem(null)
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这条观看历史吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">取消</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (!pendingDeleteItem) return
                handleDeleteSingle(pendingDeleteItem)
                setPendingDeleteItem(null)
              }}
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={batchDeleteOpen} onOpenChange={setBatchDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>确认批量删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除选中的 {selectedKeys.size} 项历史记录吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">取消</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDeleteSelected}>
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearAllOpen} onOpenChange={setClearAllOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>确认清空历史</AlertDialogTitle>
            <AlertDialogDescription>
              确定要清空全部观看历史吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">取消</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleClearAll}>
              确认清空
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
