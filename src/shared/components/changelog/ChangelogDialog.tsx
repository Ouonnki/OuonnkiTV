import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { animationPresets } from '@/shared/lib/animationVariants'
import { VersionTimeline } from './VersionTimeline'
import { VersionDetail } from './VersionDetail'

interface VersionUpdate {
  version: string
  title: string
  date: string
  features: string[]
  fixes?: string[]
  breaking?: string[]
}

interface ChangelogDialogProps {
  isOpen: boolean
  onClose: () => void
  versions: VersionUpdate[]
}

export function ChangelogDialog({ isOpen, onClose, versions }: ChangelogDialogProps) {
  const [selectedVersion, setSelectedVersion] = useState<VersionUpdate>(versions[0])
  const isMobile = useIsMobile()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="flex h-[80vh] max-h-[90vh] w-full flex-col gap-0 border-border/70 bg-card/70 p-0 backdrop-blur-xl sm:max-w-3xl sm:rounded-xl"
      >
        <DialogHeader className="shrink-0 border-b px-5 py-4">
          <DialogTitle className="text-base font-semibold">版本日志</DialogTitle>
        </DialogHeader>

        {isMobile ? (
          /* 移动端：单列手风琴 */
          <ScrollArea className="flex-1 overflow-hidden">
            <div className="p-4">
              <VersionTimeline
                versions={versions}
                selectedVersion={selectedVersion}
                onSelectVersion={setSelectedVersion}
              />
            </div>
          </ScrollArea>
        ) : (
          /* 桌面端：左侧时间轴 + 右侧详情 */
          <div className="flex min-h-0 flex-1">
            <ScrollArea className="border-r py-3 pl-3 pr-1">
              <VersionTimeline
                versions={versions}
                selectedVersion={selectedVersion}
                onSelectVersion={setSelectedVersion}
              />
            </ScrollArea>

            <ScrollArea className="flex-1">
              <div className="p-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedVersion.version}
                    variants={animationPresets.slideX}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <VersionDetail version={selectedVersion} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
