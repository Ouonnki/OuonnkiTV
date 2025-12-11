import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Chip,
  useDisclosure,
  ScrollShadow,
} from '@heroui/react'
import { useEffect } from 'react'
import { useVersionStore } from '@/store/versionStore'
import { motion } from 'framer-motion'
import ShibaIcon from '@/assets/柴犬.svg'
import HuskyIcon from '@/assets/哈士奇.svg'
import PastoralIcon from '@/assets/田园犬.svg'

export default function UpdateModal() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { getLatestUpdate, markVersionAsViewed, showUpdateModal, setShowUpdateModal } =
    useVersionStore()

  const updateInfo = getLatestUpdate() || useVersionStore.getState().updateHistory[0]

  useEffect(() => {
    // 检查是否有新版本且需要显示弹窗
    if (showUpdateModal) {
      onOpen()
    }
  }, [showUpdateModal, onOpen])

  const handleClose = () => {
    if (updateInfo) {
      markVersionAsViewed(updateInfo.version)
    }
    setShowUpdateModal(false)
    onClose()
  }

  if (!updateInfo) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      backdrop="blur"
      hideCloseButton
      isDismissable={false}
      placement="center"
      classNames={{
        backdrop: 'bg-gradient-to-br from-gray-50/80 to-gray-100/80',
        wrapper: 'flex items-center justify-center p-4',
        base: 'bg-white/80 backdrop-blur-xl backdrop-saturate-200 border border-white/50 shadow-xl max-w-full',
        header: 'px-4 sm:px-6',
        body: 'bg-transparent px-4 sm:px-6',
        footer: 'px-4 sm:px-6',
      }}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
              duration: 0.4,
              ease: [0.36, 0.66, 0.04, 1],
            },
          },
          exit: {
            y: 20,
            opacity: 0,
            scale: 0.95,
            transition: {
              duration: 0.3,
              ease: [0.36, 0.66, 0.04, 1],
            },
          },
        },
      }}
    >
      <ModalContent className="mx-0 my-0 max-h-[90vh] w-full max-w-2xl">
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-2 pb-4 sm:pb-6">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3"
              >
                <h3 className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-xl font-bold break-words text-transparent sm:text-2xl">
                  {updateInfo.title}
                </h3>
                <Chip
                  size="sm"
                  variant="flat"
                  classNames={{
                    base: 'bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300/50 flex-shrink-0',
                    content: 'text-gray-700 font-semibold text-xs',
                  }}
                >
                  v{updateInfo.version}
                </Chip>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xs font-medium text-gray-500 sm:text-sm"
              >
                {updateInfo.date} 更新
              </motion.p>
            </ModalHeader>
            <ModalBody>
              <ScrollShadow className="mt-[-3vh] max-h-[70vh] py-10" hideScrollBar>
                <div className="space-y-3 pb-4 sm:space-y-4 sm:pb-6">
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
                          <img
                            src={ShibaIcon}
                            alt="新功能"
                            className="h-6 w-6 flex-shrink-0 sm:h-8 sm:w-8"
                          />
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
                          <img
                            src={HuskyIcon}
                            alt="问题修复"
                            className="h-6 w-6 flex-shrink-0 sm:h-8 sm:w-8"
                          />
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
                          <img
                            src={PastoralIcon}
                            alt="重要变更"
                            className="h-6 w-6 flex-shrink-0 sm:h-8 sm:w-8"
                          />
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

                {/* 按钮区域 */}
                <div className="flex justify-center py-4 sm:py-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <Button
                      size="md"
                      variant="shadow"
                      onPress={handleClose}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 px-8 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl sm:px-12 sm:py-3 sm:text-base"
                    >
                      已阅
                    </Button>
                  </motion.div>
                </div>
              </ScrollShadow>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
