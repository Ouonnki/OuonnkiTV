import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import SubscriptionSourceDetail from './SubscriptionSourceDetail'
import type { VideoSource } from '@ouonnki/cms-core'

interface SubscriptionSourceDialogProps {
  source: VideoSource | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SubscriptionSourceDialog({
  source,
  open,
  onOpenChange,
}: SubscriptionSourceDialogProps) {
  if (!source) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-fit sm:max-w-md">
        <DialogHeader>
          <DialogTitle>订阅源详情</DialogTitle>
        </DialogHeader>
        <SubscriptionSourceDetail source={source} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">关闭</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
