/**
 * View Transitions API 封装
 * 提供主题切换时的圆形扩散动画效果
 */

type ViewTransitionCallback = () => void | Promise<void>

interface ViewTransitionOptions {
  /** 动画中心点 X 坐标 (相对于视口) */
  x?: number
  /** 动画中心点 Y 坐标 (相对于视口) */
  y?: number
  /** 动画方向: expand (向外扩散) 或 contract (向内收缩) */
  direction?: 'expand' | 'contract'
}

/**
 * 检测浏览器是否支持 View Transitions API
 */
export function supportsViewTransitions(): boolean {
  return (
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    typeof document.startViewTransition === 'function'
  )
}

/**
 * 执行带有圆形扩散动画的主题切换
 * 若浏览器不支持 View Transitions API，则直接执行回调
 *
 * @param callback 主题切换回调函数
 * @param options 动画选项
 */
export async function themeTransition(
  callback: ViewTransitionCallback,
  options?: ViewTransitionOptions,
): Promise<void> {
  // 不支持时直接执行
  if (!supportsViewTransitions()) {
    await callback()
    return
  }

  // 设置动画中心点
  const x = options?.x ?? window.innerWidth / 2
  const y = options?.y ?? window.innerHeight / 2
  const direction = options?.direction ?? 'expand'

  document.documentElement.style.setProperty('--vt-x', `${x}px`)
  document.documentElement.style.setProperty('--vt-y', `${y}px`)
  document.documentElement.setAttribute('data-theme-transition', direction)

  try {
    // 启动 View Transition
    const transition = document.startViewTransition(async () => {
      await callback()
    })

    await transition.finished
  } catch {
    // View Transition 失败时确保回调仍然执行
    await callback()
  } finally {
    // 清理临时变量
    document.documentElement.style.removeProperty('--vt-x')
    document.documentElement.style.removeProperty('--vt-y')
    document.documentElement.removeAttribute('data-theme-transition')
  }
}

/**
 * 从点击事件获取坐标并执行主题切换
 * @param event 点击事件
 * @param callback 主题切换回调
 * @param direction 动画方向
 */
export async function themeTransitionFromEvent(
  event: MouseEvent | React.MouseEvent,
  callback: ViewTransitionCallback,
  direction: 'expand' | 'contract' = 'expand',
): Promise<void> {
  return themeTransition(callback, {
    x: event.clientX,
    y: event.clientY,
    direction,
  })
}
