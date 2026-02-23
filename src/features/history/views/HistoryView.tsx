import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useViewingHistoryStore } from '@/shared/store'
import { useTmdbEnabled } from '@/shared/hooks/useTmdbMode'
import type { ViewingHistoryItem } from '@/shared/types'
import { HistoryDialogs, HistoryHeader, HistoryTimeline } from '../components'
import { getHistoryItemKey, groupHistoryBySection } from '../utils/history'

/**
 * HistoryView - 观看历史页面
 * 支持时间轴分区、批量删除、右键删除以及移动端/平板响应式布局
 */
export default function HistoryView() {
  const { viewingHistory, removeViewingHistoryItem, clearViewingHistory } = useViewingHistoryStore()
  const tmdbEnabled = useTmdbEnabled()

  const [selectionMode, setSelectionMode] = useState(false)
  const [actionDirection, setActionDirection] = useState(1)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [pendingDeleteItem, setPendingDeleteItem] = useState<ViewingHistoryItem | null>(null)
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false)
  const [clearAllOpen, setClearAllOpen] = useState(false)

  const sortedHistory = useMemo(() => {
    const list = tmdbEnabled
      ? viewingHistory
      : viewingHistory.filter(item => item.recordType !== 'tmdb')
    return [...list].sort((a, b) => b.timestamp - a.timestamp)
  }, [viewingHistory, tmdbEnabled])
  const hasHistory = sortedHistory.length > 0

  const allItemKeys = useMemo(() => {
    return sortedHistory.map(getHistoryItemKey)
  }, [sortedHistory])

  const itemMap = useMemo(() => {
    return new Map(sortedHistory.map(item => [getHistoryItemKey(item), item]))
  }, [sortedHistory])

  const sectionedHistory = useMemo(() => {
    return groupHistoryBySection(sortedHistory)
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

  const enableSelectionMode = useCallback(() => {
    setSelectionMode(previous => {
      if (previous) return previous
      setActionDirection(1)
      return true
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
      removeViewingHistoryItem(item)
      setSelectedKeys(previous => {
        const next = new Set(previous)
        next.delete(getHistoryItemKey(item))
        return next
      })
      toast.success('已删除历史记录')
    },
    [removeViewingHistoryItem],
  )

  const handleDeleteSelected = useCallback(() => {
    let deletedCount = 0
    selectedKeys.forEach(itemKey => {
      const item = itemMap.get(itemKey)
      if (!item) return
      removeViewingHistoryItem(item)
      deletedCount += 1
    })

    setSelectedKeys(new Set())
    setSelectionMode(false)
    setBatchDeleteOpen(false)
    toast.success(`已删除 ${deletedCount} 条历史记录`)
  }, [itemMap, removeViewingHistoryItem, selectedKeys])

  const handleClearAll = useCallback(() => {
    clearViewingHistory()
    setSelectedKeys(new Set())
    setSelectionMode(false)
    setClearAllOpen(false)
    toast.success('已清空全部历史记录')
  }, [clearViewingHistory])

  return (
    <div className="min-h-full">
      <HistoryHeader
        totalCount={sortedHistory.length}
        hasHistory={hasHistory}
        selectionMode={selectionMode}
        selectedCount={selectedKeys.size}
        isAllSelected={isAllSelected}
        actionDirection={actionDirection}
        onToggleSelectionMode={toggleSelectionMode}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onOpenBatchDelete={() => setBatchDeleteOpen(true)}
        onOpenClearAll={() => setClearAllOpen(true)}
      />

      <HistoryTimeline
        hasHistory={hasHistory}
        sectionedHistory={sectionedHistory}
        selectedKeys={selectedKeys}
        selectionMode={selectionMode}
        onToggleItemSelected={toggleItemSelected}
        onEnableSelectionMode={enableSelectionMode}
        onRequestDeleteItem={setPendingDeleteItem}
      />

      <HistoryDialogs
        pendingDeleteItem={pendingDeleteItem}
        batchDeleteOpen={batchDeleteOpen}
        clearAllOpen={clearAllOpen}
        selectedCount={selectedKeys.size}
        onPendingDeleteChange={setPendingDeleteItem}
        onBatchDeleteOpenChange={setBatchDeleteOpen}
        onClearAllOpenChange={setClearAllOpen}
        onDeleteSingle={handleDeleteSingle}
        onDeleteSelected={handleDeleteSelected}
        onClearAll={handleClearAll}
      />
    </div>
  )
}
