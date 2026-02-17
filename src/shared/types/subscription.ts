/**
 * 视频源订阅元数据
 */
export interface VideoSourceSubscription {
  /** 订阅唯一标识（UUID） */
  id: string
  /** 订阅名称（用户自定义或从 URL 推断） */
  name: string
  /** 订阅 URL（返回 JSON 数组的远程地址） */
  url: string
  /** 上次刷新获取到的源数量 */
  sourceCount: number
  /** 上次刷新时间 */
  lastRefreshedAt: Date | null
  /** 上次刷新是否成功 */
  lastRefreshSuccess: boolean
  /** 上次刷新失败时的错误信息 */
  lastRefreshError: string | null
  /** 自动刷新间隔（分钟），0 = 不自动刷新 */
  refreshInterval: number
  /** 创建时间 */
  createdAt: Date
}
