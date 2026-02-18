import { useState, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import { StatusTabs } from '../components/StatusTabs'
import { FavoritesGrid } from '../components/ui/favoritesGrid'
import { ManagementPanel } from '../components/ManagementPanel'
import { useFavorites } from '../hooks/useFavorites'
import { usePortalToSidebarInset } from '@/shared/hooks/usePortalToSidebarInset'
import { FavoriteWatchStatus } from '../types/favorites'
import { NoResultIcon } from '@/shared/components/icons'

/**
 * FavoritesView - 收藏页面
 * 支持按状态分类展示、多选编辑、批量删除
 */
export default function FavoritesView() {
  const {
    filteredFavorites,
    stats,
    removeFavorite,
    removeFavorites,
    updateWatchStatus,
    setSelectedIds: setStoreSelectedIds,
  } = useFavorites()

  const { SidebarInsetPortal } = usePortalToSidebarInset()

  const [activeTab, setActiveTab] = useState<FavoriteWatchStatus | 'all'>('all')
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // 当前显示的收藏列表（根据状态标签筛选）
  const displayFavorites = useMemo(() => {
    if (activeTab === 'all') {
      return filteredFavorites
    }
    return filteredFavorites.filter(f => f.watchStatus === activeTab)
  }, [filteredFavorites, activeTab])

  // 清空当前 tab 的所有收藏
  const handleClearAll = useCallback(() => {
    const currentTabIds = displayFavorites.map(f => f.id)
    removeFavorites(currentTabIds)
    setSelectedIds(new Set())
    setStoreSelectedIds(new Set())
    setSelectionMode(false)
    toast.success(`已清空 ${currentTabIds.length} 个收藏`)
  }, [displayFavorites, removeFavorites, setStoreSelectedIds])

  // 切换状态标签
  const handleTabChange = useCallback(
    (status: FavoriteWatchStatus | 'all') => {
      setActiveTab(status)
    },
    [],
  )

  // 进入/退出多选模式
  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => !prev)
    setSelectedIds(new Set())
    setStoreSelectedIds(new Set())
  }, [setStoreSelectedIds])

  // 全选当前 tab 下的项目
  const handleSelectAll = useCallback(() => {
    const currentTabIds = new Set(displayFavorites.map(f => f.id))
    setSelectedIds(currentTabIds)
    setStoreSelectedIds(currentTabIds)
  }, [displayFavorites, setStoreSelectedIds])

  // 取消全选
  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set())
    setStoreSelectedIds(new Set())
  }, [setStoreSelectedIds])

  // 批量删除
  const handleDeleteSelected = useCallback(() => {
    const idsToDelete = Array.from(selectedIds)
    removeFavorites(idsToDelete)
    setSelectedIds(new Set())
    toast.success(`已删除 ${idsToDelete.length} 个收藏`)
  }, [selectedIds, removeFavorites])

  const hasContent = displayFavorites.length > 0
  const isAllSelected = selectedIds.size === displayFavorites.length && displayFavorites.length > 0

  return (
    <div className="min-h-full">
      {/* 页面头部 */}
      <header className="border-border bg-sidebar/80 sticky top-0 z-20 border-b backdrop-blur-md">
        <div className="px-4 py-1.5 md:py-2">
          <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-bold md:text-lg">收藏</h1>
                {stats.total > 0 && (
                  <span className="text-muted-foreground shrink-0 text-xs md:text-sm">
                    共 <span className="text-primary font-medium">{stats.total}</span> 项
                  </span>
                )}
              </div>
            </div>
            <div className="order-3 w-full md:order-none md:ml-auto md:flex md:w-[min(58vw,760px)] md:justify-end">
              <StatusTabs currentStatus={activeTab} onStatusChange={handleTabChange} stats={stats} />
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="px-4 py-6">
        {!hasContent ? (
          <div className="flex flex-col items-center justify-center py-32">
            <NoResultIcon size={128} className="text-muted-foreground/30" />
            <p className="text-muted-foreground mt-4 text-sm">
              {activeTab === 'all'
                ? '暂无收藏内容'
                : activeTab === FavoriteWatchStatus.NOT_WATCHED
                  ? '暂无未观看的内容'
                  : activeTab === FavoriteWatchStatus.WATCHING
                    ? '暂无正在看的内容'
                    : '暂无已看完的内容'}
            </p>
          </div>
        ) : (
          <FavoritesGrid
            favorites={displayFavorites}
            selectedIds={selectedIds}
            onSelectionChange={selected => {
              setSelectedIds(selected)
              setStoreSelectedIds(selected)
            }}
            selectionMode={selectionMode}
            onUpdateWatchStatus={updateWatchStatus}
            onRemoveFavorite={removeFavorite}
          />
        )}
      </main>

      {/* 管理面板 - 通过 Portal 传送到 SidebarInset 层级 */}
      {hasContent && (
        <SidebarInsetPortal>
          <ManagementPanel
            isOpen={selectionMode}
            selectedCount={selectedIds.size}
            totalCount={displayFavorites.length}
            isAllSelected={isAllSelected}
            onExit={toggleSelectionMode}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onClearAll={handleClearAll}
            onDeleteSelected={handleDeleteSelected}
          />
        </SidebarInsetPortal>
      )}
    </div>
  )
}
