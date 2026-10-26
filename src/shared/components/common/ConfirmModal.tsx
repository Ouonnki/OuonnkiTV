import { Trash2 } from 'lucide-react'
import type { RefObject } from 'react'
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

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  returnFocusRef?: RefObject<HTMLElement | null>
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = '确认',
  cancelText = '取消',
  isDestructive = false,
  returnFocusRef,
}: ConfirmModalProps) => (
  <AlertDialog
    open={isOpen}
    onOpenChange={open => {
      if (!open) onClose()
    }}
  >
    <AlertDialogContent
      size="sm"
      className="max-h-[calc(100dvh-2rem)] overflow-y-auto"
      onCloseAutoFocus={event => {
        if (returnFocusRef?.current?.isConnected) {
          event.preventDefault()
          returnFocusRef.current.focus()
        }
      }}
    >
      <AlertDialogHeader>
        {isDestructive && (
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
            <Trash2 />
          </AlertDialogMedia>
        )}
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel variant="outline">{cancelText}</AlertDialogCancel>
        <AlertDialogAction variant={isDestructive ? 'destructive' : 'default'} onClick={onConfirm}>
          {confirmText}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)
