/**
 * 并发控制器类型
 */
export type ConcurrencyLimiter = <T>(task: () => Promise<T>) => Promise<T>

/**
 * 创建并发控制器
 * @param limit 最大并发数
 */
export function createConcurrencyLimiter(limit: number): ConcurrencyLimiter {
  let running = 0
  const queue: (() => void)[] = []

  const tryRun = () => {
    while (running < limit && queue.length > 0) {
      const next = queue.shift()
      if (next) {
        running++
        next()
      }
    }
  }

  return <T>(task: () => Promise<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
      const run = () => {
        task()
          .then(resolve)
          .catch(reject)
          .finally(() => {
            running--
            tryRun()
          })
      }

      queue.push(run)
      tryRun()
    })
  }
}
