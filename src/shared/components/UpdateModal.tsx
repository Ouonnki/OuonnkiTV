import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { useEffect, useState } from 'react'
import { useVersionStore } from '@/shared/store/versionStore'
import { motion } from 'framer-motion'
import { Sparkles, Wrench, Zap } from 'lucide-react'

export default function UpdateModal() {
  const [isOpen, setIsOpen] = useState(false)
  const { getLatestUpdate, markVersionAsViewed, showUpdateModal, setShowUpdateModal } =
    useVersionStore()

  const updateInfo = getLatestUpdate() || useVersionStore.getState().updateHistory[0]

  useEffect(() => {
    if (showUpdateModal) {
      setIsOpen(true)
    }
  }, [showUpdateModal])

  const handleClose = () => {
    if (updateInfo) {
      markVersionAsViewed(updateInfo.version)
    }
    setShowUpdateModal(false)
    setIsOpen(false)
  }

  if (!updateInfo) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] w-full max-w-2xl border-white/50 bg-white/80 p-0 backdrop-blur-xl backdrop-saturate-200 sm:rounded-xl">
        <DialogHeader className="px-4 pt-6 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3"
          >
            <DialogTitle className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-xl font-bold break-words text-transparent sm:text-2xl">
              {updateInfo.title}
            </DialogTitle>
            <Badge
              variant="secondary"
              className="flex-shrink-0 border border-gray-300/50 bg-gradient-to-r from-gray-100 to-gray-200 text-xs font-semibold text-gray-700"
            >
              v{updateInfo.version}
            </Badge>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xs font-medium text-gray-500 sm:text-sm"
          >
            {updateInfo.date} 更新
          </motion.p>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-4 sm:px-6">
          <div className="space-y-3 py-4 sm:space-y-4">
            {/* 新功能 */}
            {updateInfo.features && updateInfo.features.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative"
              >
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-emerald-400/20 to-teal-400/20 blur-xl sm:rounded-xl" />
                <div className="relative rounded-lg border border-emerald-200/30 bg-gradient-to-br from-emerald-50/90 to-teal-50/90 p-3 backdrop-blur-sm sm:rounded-xl sm:p-5">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-emerald-800 sm:mb-3 sm:text-base">
                    <Sparkles className="h-6 w-6 flex-shrink-0 text-emerald-600 sm:h-8 sm:w-8" />
                    <span>新功能</span>
                  </h4>
                  <ul className="space-y-2 sm:space-y-2.5">
                    {updateInfo.features.map((feature, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                        className="flex items-start gap-2 text-xs sm:gap-3 sm:text-sm"
                      >
                        <span className="mt-0.5 h-1 w-1 flex-shrink-0 rounded-full bg-emerald-500 sm:mt-1 sm:h-1.5 sm:w-1.5" />
                        <span className="leading-relaxed break-words text-gray-700">
                          {feature}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* 修复 */}
            {updateInfo.fixes && updateInfo.fixes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative"
              >
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-amber-400/20 to-orange-400/20 blur-xl sm:rounded-xl" />
                <div className="relative rounded-lg border border-amber-200/30 bg-gradient-to-br from-amber-50/90 to-orange-50/90 p-3 backdrop-blur-sm sm:rounded-xl sm:p-5">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-800 sm:mb-3 sm:text-base">
                    <Wrench className="h-6 w-6 flex-shrink-0 text-amber-600 sm:h-8 sm:w-8" />
                    <span>问题修复</span>
                  </h4>
                  <ul className="space-y-2 sm:space-y-2.5">
                    {updateInfo.fixes.map((fix, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: 0.5 + updateInfo.features.length * 0.1 + index * 0.1,
                        }}
                        className="flex items-start gap-2 text-xs sm:gap-3 sm:text-sm"
                      >
                        <span className="mt-0.5 h-1 w-1 flex-shrink-0 rounded-full bg-amber-500 sm:mt-1 sm:h-1.5 sm:w-1.5" />
                        <span className="leading-relaxed break-words text-gray-700">
                          {fix}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* 破坏性更新 */}
            {updateInfo.breaking && updateInfo.breaking.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="relative"
              >
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-rose-400/20 to-pink-400/20 blur-xl sm:rounded-xl" />
                <div className="relative rounded-lg border border-rose-200/30 bg-gradient-to-br from-rose-50/90 to-pink-50/90 p-3 backdrop-blur-sm sm:rounded-xl sm:p-5">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-rose-800 sm:mb-3 sm:text-base">
                    <Zap className="h-6 w-6 flex-shrink-0 text-rose-600 sm:h-8 sm:w-8" />
                    <span>重要变更</span>
                  </h4>
                  <ul className="space-y-2 sm:space-y-2.5">
                    {updateInfo.breaking.map((breaking, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.4,
                          delay:
                            0.6 +
                            (updateInfo.features?.length || 0) * 0.1 +
                            (updateInfo.fixes?.length || 0) * 0.1 +
                            index * 0.1,
                        }}
                        className="flex items-start gap-2 text-xs sm:gap-3 sm:text-sm"
                      >
                        <span className="mt-0.5 h-1 w-1 flex-shrink-0 rounded-full bg-rose-500 sm:mt-1 sm:h-1.5 sm:w-1.5" />
                        <span className="leading-relaxed break-words text-gray-700">
                          {breaking}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* 按钮区域 */}
        <div className="flex justify-center px-4 py-4 sm:px-6 sm:py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Button
              onClick={handleClose}
              className="bg-gradient-to-r from-gray-600 to-gray-700 px-8 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl sm:px-12 sm:py-3 sm:text-base"
            >
              已阅
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
