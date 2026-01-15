/* eslint-disable @typescript-eslint/no-explicit-any */
import type { M3u8Processor } from './processor'

/**
 * HLS加载器配置
 */
export interface HlsLoaderConfig {
  /** M3U8处理器 */
  m3u8Processor: M3u8Processor
  /** HLS.js 模块引用，用于获取默认加载器 */
  Hls: any
}

/**
 * 创建HLS.js兼容的加载器类
 * 注意：此函数返回一个类，需要在HLS.js配置中使用
 *
 * @example
 * ```typescript
 * import Hls from 'hls.js'
 * import { createM3u8Processor, createHlsLoaderClass } from '@ouonnki/cms-core/m3u8'
 *
 * const processor = createM3u8Processor({ filterAds: true })
 * const CustomLoader = createHlsLoaderClass({ m3u8Processor: processor, Hls })
 *
 * const hls = new Hls({
 *   loader: CustomLoader
 * })
 * ```
 */
export function createHlsLoaderClass(config: HlsLoaderConfig): any {
  const { m3u8Processor, Hls } = config

  // 获取默认加载器类
  const DefaultLoader = Hls.DefaultConfig.loader

  // 创建继承默认加载器的自定义类
  return class CustomHlsLoader extends DefaultLoader {
    constructor(hlsConfig: any) {
      super(hlsConfig)

      // 保存原始load方法
      const originalLoad = this.load.bind(this)

      // 重写load方法
      this.load = (context: any, loadConfig: any, callbacks: any) => {
        // 检查是否是manifest或level类型
        if (context.type === 'manifest' || context.type === 'level') {
          const originalOnSuccess = callbacks.onSuccess

          callbacks.onSuccess = (response: any, stats: any, ctx: any, networkDetails: unknown) => {
            // 处理M3U8内容
            if (response.data && typeof response.data === 'string') {
              response.data = m3u8Processor.process(response.data)
            }
            return originalOnSuccess(response, stats, ctx, networkDetails)
          }
        }

        originalLoad(context, loadConfig, callbacks)
      }
    }
  }
}

/**
 * 创建简化的M3U8处理回调
 * 用于不使用类继承的场景
 */
export function createM3u8LoaderCallback(
  m3u8Processor: M3u8Processor,
): (response: { data?: string }) => void {
  return response => {
    if (response.data && typeof response.data === 'string') {
      response.data = m3u8Processor.process(response.data)
    }
  }
}
