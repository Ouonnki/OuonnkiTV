import type { CmsEvent, CmsEventType, EventHandler, EventByType } from '../types'

/**
 * CMS事件发射器接口
 */
export interface CmsEventEmitter {
  /**
   * 订阅事件
   * @param type 事件类型
   * @param handler 事件处理器
   * @returns 取消订阅函数
   */
  on<T extends CmsEventType>(type: T, handler: EventHandler<EventByType<T>>): () => void

  /**
   * 取消订阅
   * @param type 事件类型
   * @param handler 事件处理器
   */
  off<T extends CmsEventType>(type: T, handler: EventHandler<EventByType<T>>): void

  /**
   * 订阅一次性事件
   * @param type 事件类型
   * @param handler 事件处理器
   * @returns 取消订阅函数
   */
  once<T extends CmsEventType>(type: T, handler: EventHandler<EventByType<T>>): () => void

  /**
   * 发射事件
   * @param event 事件对象
   */
  emit<T extends CmsEvent>(event: T): void

  /**
   * 移除所有监听器
   * @param type 可选的事件类型，不传则移除所有
   */
  removeAllListeners(type?: CmsEventType): void
}

/**
 * 创建CMS事件发射器
 */
export function createEventEmitter(): CmsEventEmitter {
  const listeners = new Map<CmsEventType, Set<EventHandler<CmsEvent>>>()

  return {
    on<T extends CmsEventType>(type: T, handler: EventHandler<EventByType<T>>): () => void {
      if (!listeners.has(type)) {
        listeners.set(type, new Set())
      }
      listeners.get(type)!.add(handler as EventHandler<CmsEvent>)

      return () => this.off(type, handler)
    },

    off<T extends CmsEventType>(type: T, handler: EventHandler<EventByType<T>>): void {
      const typeListeners = listeners.get(type)
      if (typeListeners) {
        typeListeners.delete(handler as EventHandler<CmsEvent>)
        if (typeListeners.size === 0) {
          listeners.delete(type)
        }
      }
    },

    once<T extends CmsEventType>(type: T, handler: EventHandler<EventByType<T>>): () => void {
      const wrapper: EventHandler<EventByType<T>> = (event) => {
        this.off(type, wrapper)
        handler(event)
      }
      return this.on(type, wrapper)
    },

    emit<T extends CmsEvent>(event: T): void {
      const typeListeners = listeners.get(event.type as CmsEventType)
      if (typeListeners) {
        // 创建副本避免在遍历时修改
        const handlersCopy = Array.from(typeListeners)
        for (const handler of handlersCopy) {
          try {
            handler(event)
          } catch (error) {
            console.error(`Event handler error for ${event.type}:`, error)
          }
        }
      }
    },

    removeAllListeners(type?: CmsEventType): void {
      if (type) {
        listeners.delete(type)
      } else {
        listeners.clear()
      }
    },
  }
}
