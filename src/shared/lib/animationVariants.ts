import { type Variants } from 'framer-motion'

/**
 * 页面过渡动画变体配置
 */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quad
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: 'blur(4px)',
    transition: {
      duration: 0.2,
      ease: [0.55, 0.055, 0.675, 0.19], // ease-in-quad
    },
  },
}

/**
 * 预设的动画变体集合
 */
export const animationPresets = {
  /** 淡入淡出 + 轻微上移 */
  fadeUp: pageVariants,

  /** 纯淡入淡出 */
  fade: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2, ease: 'easeIn' },
    },
  } satisfies Variants,

  /** 缩放 + 淡入淡出 */
  scale: {
    initial: { opacity: 0, scale: 0.96 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      transition: { duration: 0.2, ease: [0.55, 0.055, 0.675, 0.19] },
    },
  } satisfies Variants,

  /** 水平滑动 */
  slideX: {
    initial: { opacity: 0, x: 20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2, ease: 'easeIn' },
    },
  } satisfies Variants,
} as const
