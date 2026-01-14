import { track } from '@vercel/analytics'

// Vercel Analytics 配置
export const analyticsConfig = {
  // Analytics 会自动在生产环境启用
  // 在开发环境中默认是禁用的
  debug: false, // 设置为 true 可以在控制台看到分析事件

  // Speed Insights 配置
  speedInsights: {
    // 采样率：0-1 之间的值，1 表示 100% 采样
    sampleRate: 1,
    // 是否在开发环境启用
    debug: false,
  },
}

// 自定义事件跟踪
// properties 参数可以是 string, number, boolean, null 类型的值
export const trackEvent = (
  eventName: string,
  properties?: Record<string, string | number | boolean | null>,
) => {
  // 当禁用Analytics时不执行跟踪
  if (import.meta.env.VITE_DISABLE_ANALYTICS !== 'true') {
    track(eventName, properties)
  }
}
