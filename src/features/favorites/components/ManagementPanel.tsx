import { Edit3, CheckSquare, Square, Trash2, X, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog'
import { useIsMobile } from '@/shared/hooks/use-mobile'

export interface ManagementPanelProps {
  isOpen: boolean
  selectedCount: number
  totalCount: number
  isAllSelected: boolean
  onExit: () => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onClearAll: () => void
  onDeleteSelected: () => void
}

/** 桌面端：宽度从圆形(48px)弹性展开到自适应 */
const desktopPanelVariants = {
  initial: { width: 48 },
  animate: {
    width: 'auto',
    transition: {
      width: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
  exit: {
    width: 48,
    transition: {
      width: { duration: 0.18, ease: [0.4, 0, 1, 1], delay: 0.08 },
      staggerChildren: 0.015,
      staggerDirection: -1,
    },
  },
}

/** 移动端：从底部滑入全宽底栏 */
const mobilePanelVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.1, 0.25, 1],
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: 16,
    transition: {
      duration: 0.15,
      staggerChildren: 0.015,
      staggerDirection: -1,
    },
  },
}

/** 面板内各元素：从右侧滑入/退出 */
const itemVariants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 500, damping: 30 },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.08 },
  },
}

/** 收缩态笔图标：从左侧滑入 */
const penIconVariants = {
  initial: { x: -15, opacity: 0, scale: 0.8 },
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 500, damping: 25 },
  },
  exit: {
    x: -15,
    opacity: 0,
    transition: { duration: 0.12 },
  },
}

/**
 * ManagementPanel - 管理面板组件
 * 多选模式时显示在右下角，提供批量操作功能
 * 展开时宽度弹性扩展、元素从右侧交错进入；收缩时反向退出、笔图标从左侧滑入
 */
export function ManagementPanel({
  isOpen,
  selectedCount,
  totalCount,
  isAllSelected,
  onExit,
  onSelectAll,
  onDeselectAll,
  onClearAll,
  onDeleteSelected,
}: ManagementPanelProps) {
  const isMobile = useIsMobile()

  return (
    <div
      className="absolute z-50"
      style={
        isMobile
          ? {
              bottom: '1.25rem',
              right: '0.75rem',
              left: isOpen ? '0.75rem' : undefined,
            }
          : {
              bottom: '2rem',
              right: isOpen ? '50%' : '2rem',
              transform: isOpen ? 'translateX(50%)' : 'translateX(0)',
              maxWidth: isOpen ? 'calc(100% - 3rem)' : undefined,
              transition:
                'right 0.35s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)',
            }
      }
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="expanded-panel"
            variants={isMobile ? mobilePanelVariants : desktopPanelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="bg-background/95 border-border flex items-center gap-1 overflow-hidden rounded-3xl border px-3 shadow-2xl backdrop-blur-md"
            style={{ height: 48 }}
          >
            {/* 全选/取消 */}
            <motion.div variants={itemVariants}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-full px-2.5 text-sm"
                onClick={isAllSelected ? onDeselectAll : onSelectAll}
              >
                {isAllSelected ? (
                  <>
                    <CheckSquare className="mr-1 size-4" />
                    取消
                  </>
                ) : (
                  <>
                    <Square className="mr-1 size-4" />
                    全选
                  </>
                )}
              </Button>
            </motion.div>

            {/* 计数 */}
            <motion.span
              variants={itemVariants}
              className="text-muted-foreground shrink-0 text-sm tabular-nums"
            >
              {selectedCount}/{totalCount}
            </motion.span>

            {/* 清空 */}
            <motion.div variants={itemVariants}>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive h-8 rounded-full px-2.5 text-sm"
                  >
                    <XCircle className="mr-1 size-4" />
                    清空
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent size="sm">
                  <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                      <Trash2 />
                    </AlertDialogMedia>
                    <AlertDialogTitle>确认清空</AlertDialogTitle>
                    <AlertDialogDescription>
                      确定要清空当前分类下的所有收藏项吗？此操作无法撤销。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel variant="outline">取消</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={onClearAll}>
                      确认清空
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </motion.div>

            {/* 分隔线 */}
            <motion.div
              variants={itemVariants}
              className="bg-border mx-1 h-4 w-px shrink-0"
            />

            {/* 删除选中 */}
            <motion.div variants={itemVariants}>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 w-8 rounded-full p-0"
                    disabled={selectedCount === 0}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent size="sm">
                  <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                      <Trash2 />
                    </AlertDialogMedia>
                    <AlertDialogTitle>确认删除</AlertDialogTitle>
                    <AlertDialogDescription>
                      确定要删除选中的 {selectedCount} 个收藏项吗？此操作无法撤销。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel variant="outline">取消</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={onDeleteSelected}>
                      确认删除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </motion.div>

            {/* 退出按钮 */}
            <motion.div variants={itemVariants}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-full p-0"
                onClick={onExit}
              >
                <X className="size-4" />
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="collapsed-button"
            variants={penIconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Button
              size="lg"
              className="bg-background text-foreground border-border hover:bg-accent h-12 w-12 rounded-full border shadow-lg"
              onClick={onExit}
            >
              <Edit3 className="size-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
