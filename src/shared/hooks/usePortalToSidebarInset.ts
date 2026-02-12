import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'

const SIDEBAR_INSET_SELECTOR = '[data-slot="sidebar-inset"]'

/**
 * 用于将组件传送到 SidebarInset 层级的通用 hook
 * 解决在 ScrollArea 内的组件使用 fixed/absolute 定位时无法正确相对于内容区域定位的问题
 *
 * @example
 * function MyComponent() {
 *   const { SidebarInsetPortal, target } = usePortalToSidebarInset()
 *
 *   return (
 *     <>
 *       <div>普通内容</div>
 *       {target && (
 *         <SidebarInsetPortal>
 *           <div className="fixed bottom-4 right-4">固定在右下角</div>
 *         </SidebarInsetPortal>
 *       )}
 *     </>
 *   )
 * }
 */
export function usePortalToSidebarInset() {
  const [target, setTarget] = useState<Element | null>(null)

  // 获取 SidebarInset 元素
  const getTarget = useCallback(() => {
    return document.querySelector(SIDEBAR_INSET_SELECTOR)
  }, [])

  // 初始化时获取目标元素
  useEffect(() => {
    setTarget(getTarget())
  }, [getTarget])

  /**
   * Portal 组件包装器
   * 只有当目标元素存在时才渲染子内容
   */
  const SidebarInsetPortal = useCallback(
    ({ children }: { children: React.ReactNode }) => {
      if (!target) return null
      return createPortal(children, target)
    },
    [target],
  )

  return {
    /** 目标容器元素，存在时才渲染 Portal 内容 */
    target,
    /** Portal 组件包装器 */
    SidebarInsetPortal,
  }
}
