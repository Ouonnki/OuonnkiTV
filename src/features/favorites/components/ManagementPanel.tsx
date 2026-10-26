import { useRef, useState } from 'react'
import { ConfirmModal } from '@/shared/components/common/ConfirmModal'
import {
  SelectionToolbar,
  type SelectionToolbarProps,
} from '@/shared/components/common/SelectionToolbar'

export type ManagementPanelProps = SelectionToolbarProps

export function ManagementPanel(props: ManagementPanelProps) {
  const [clearOpen, setClearOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const returnFocusRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <SelectionToolbar
        {...props}
        onClearAll={event => {
          returnFocusRef.current = event?.currentTarget ?? null
          setClearOpen(true)
        }}
        onDeleteSelected={event => {
          returnFocusRef.current = event?.currentTarget ?? null
          setDeleteOpen(true)
        }}
      />
      <ConfirmModal
        isOpen={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={props.onClearAll}
        title="确认清空收藏？"
        description="确定要清空当前分类下的所有收藏项吗？此操作无法撤销。"
        confirmText="确认清空"
        isDestructive
        returnFocusRef={returnFocusRef}
      />
      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={props.onDeleteSelected}
        title="确认删除收藏？"
        description={`确定要删除选中的 ${props.selectedCount} 个收藏项吗？此操作无法撤销。`}
        confirmText="确认删除"
        isDestructive
        returnFocusRef={returnFocusRef}
      />
    </>
  )
}
