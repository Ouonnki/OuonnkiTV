import { useSettingStore } from '@/shared/store/settingStore'
import { useApiStore } from '@/shared/store/apiStore'
import {
  useSubscriptionStore,
  isSubscriptionSource,
} from '@/shared/store/subscriptionStore'
import { toast } from 'sonner'
import dayjs from 'dayjs'
import { z } from 'zod'

const videoSourceSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  url: z.string(),
  detailUrl: z.string().optional(),
  isEnabled: z.boolean().optional(),
  timeout: z.number().optional(),
  retry: z.number().optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
})

const subscriptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  sourceCount: z.number().optional(),
  lastRefreshedAt: z.union([z.string(), z.date()]).nullable().optional(),
  lastRefreshSuccess: z.boolean().optional(),
  lastRefreshError: z.string().nullable().optional(),
  refreshInterval: z.number().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
})

const personalConfigSchema = z.object({
  settings: z.object({
    network: z
      .object({
        defaultTimeout: z.number().min(300).optional(),
        defaultRetry: z.number().min(0).max(10).optional(),
        concurrencyLimit: z.number().min(1).max(10).optional(),
        isProxyEnabled: z.boolean().optional(),
        proxyUrl: z.string().optional(),
      })
      .optional(),
    search: z
      .object({
        isSearchHistoryEnabled: z.boolean().optional(),
        isSearchHistoryVisible: z.boolean().optional(),
        maxSearchHistoryCount: z.number().min(5).max(100).optional(),
      })
      .optional(),
    playback: z
      .object({
        isViewingHistoryEnabled: z.boolean().optional(),
        isViewingHistoryVisible: z.boolean().optional(),
        isAutoPlayEnabled: z.boolean().optional(),
        defaultEpisodeOrder: z.enum(['asc', 'desc']).optional(),
        defaultVolume: z.number().min(0).max(1).optional(),
        playerThemeColor: z.string().optional(),
        maxViewingHistoryCount: z.number().min(10).max(500).optional(),
        tmdbMatchCacheTTLHours: z.number().min(1).max(168).optional(),
        isLoopEnabled: z.boolean().optional(),
        isPipEnabled: z.boolean().optional(),
        isAutoMiniEnabled: z.boolean().optional(),
        isScreenshotEnabled: z.boolean().optional(),
        isMobileGestureEnabled: z.boolean().optional(),
        // 向后兼容：旧版配置可能在 playback 中包含 adFilteringEnabled
        adFilteringEnabled: z.boolean().optional(),
      })
      .optional(),
    system: z
      .object({
        isUpdateLogEnabled: z.boolean().optional(),
        tmdbLanguage: z.string().optional(),
        tmdbImageQuality: z.enum(['low', 'medium', 'high']).optional(),
      })
      .optional(),
  }),
  videoSources: z.array(videoSourceSchema),
  // 订阅数据
  subscriptions: z.array(subscriptionSchema).optional(),
  // 新版配置中 adFilteringEnabled 独立于 settings
  adFilteringEnabled: z.boolean().optional(),
  meta: z
    .object({
      version: z.string(),
      exportDate: z.string(),
    })
    .optional(),
})

function buildExportPayload() {
  const settingState = useSettingStore.getState()
  const apiState = useApiStore.getState()
  const subscriptionState = useSubscriptionStore.getState()

  return {
    settings: {
      network: settingState.network,
      search: settingState.search,
      playback: settingState.playback,
      system: settingState.system,
    },
    // 导出时过滤掉订阅源，仅保留手动维护的视频源
    videoSources: apiState.videoAPIs.filter(s => !isSubscriptionSource(s.id)),
    subscriptions: subscriptionState.subscriptions,
    adFilteringEnabled: apiState.adFilteringEnabled,
    meta: {
      version: '3.0',
      exportDate: new Date().toISOString(),
    },
  }
}

export const usePersonalConfig = () => {
  const settingStore = useSettingStore()
  const apiStore = useApiStore()

  const exportConfig = () => {
    try {
      const config = buildExportPayload()
      const data = JSON.stringify(config, null, 2)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ouonnki-tv-config-${dayjs().format('YYYY-MM-DD-HH-mm')}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('配置导出成功')
    } catch (error) {
      console.error('Export config error:', error)
      toast.error('配置导出失败')
    }
  }

  const exportConfigToText = async () => {
    try {
      const config = buildExportPayload()
      const data = JSON.stringify(config, null, 2)
      await navigator.clipboard.writeText(data)
      toast.success('配置已复制到剪贴板')
    } catch (error) {
      console.error('Export text config error:', error)
      toast.error('复制失败，请重试')
    }
  }

  const validateAndRestore = async (rawConfig: unknown) => {
    const result = personalConfigSchema.safeParse(rawConfig)
    if (!result.success) {
      const errorMessages = result.error.issues
        .slice(0, 3)
        .map(issue => `${issue.path.join('.')}: ${issue.message}`)
        .join('；')
      throw new Error(`配置格式错误：${errorMessages}`)
    }

    const config = result.data

    // 恢复设置
    if (config.settings.network) settingStore.setNetworkSettings(config.settings.network)
    if (config.settings.search) settingStore.setSearchSettings(config.settings.search)
    if (config.settings.playback) {
      settingStore.setPlaybackSettings(config.settings.playback)
    }
    if (config.settings.system) settingStore.setSystemSettings(config.settings.system)

    // 恢复广告过滤设置：优先使用顶层字段，向后兼容旧版 playback 中的值
    const adFilteringValue =
      config.adFilteringEnabled ?? config.settings.playback?.adFilteringEnabled
    if (typeof adFilteringValue === 'boolean') {
      apiStore.setAdFilteringEnabled(adFilteringValue)
    }

    // 恢复视频源（importVideoAPIs 内部会为缺少 id 的源生成 UUID）
    apiStore.importVideoAPIs(config.videoSources as Parameters<typeof apiStore.importVideoAPIs>[0])

    // 恢复订阅：清空现有订阅后逐一重建（addSubscription 会自动拉取最新数据）
    if (config.subscriptions && config.subscriptions.length > 0) {
      const subscriptionStore = useSubscriptionStore.getState()
      // 清空现有订阅
      for (const existing of subscriptionStore.subscriptions) {
        subscriptionStore.removeSubscription(existing.id)
      }
      // 逐一添加导入的订阅
      for (const sub of config.subscriptions) {
        await subscriptionStore.addSubscription(
          sub.url,
          sub.name,
          sub.refreshInterval ?? 60,
        )
      }
    }

    toast.success('配置导入成功')
  }

  const importConfig = async (file: File) => {
    const reader = new FileReader()
    reader.onload = async e => {
      try {
        const content = e.target?.result as string
        const rawConfig = JSON.parse(content)
        await validateAndRestore(rawConfig)
      } catch (error) {
        console.error('Import config error:', error)
        if (error instanceof Error) {
          toast.error(`配置导入失败：${error.message}`)
        } else {
          toast.error('配置导入失败：文件格式错误')
        }
      }
    }
    reader.readAsText(file)
  }

  const importConfigFromText = async (text: string) => {
    try {
      const rawConfig = JSON.parse(text)
      await validateAndRestore(rawConfig)
      return true
    } catch (error) {
      console.error('Import text config error:', error)
      if (error instanceof Error) {
        toast.error(`配置导入失败：${error.message}`)
      } else {
        toast.error('配置导入失败：JSON 格式错误')
      }
      return false
    }
  }

  const importConfigFromURL = async (url: string) => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const rawConfig = await response.json()
      await validateAndRestore(rawConfig)
      return true
    } catch (error) {
      console.error('Import url config error:', error)
      if (error instanceof Error) {
        toast.error(`配置导入失败：${error.message}`)
      } else {
        toast.error('配置导入失败：网络请求或解析错误')
      }
      return false
    }
  }

  const restoreDefault = async () => {
    try {
      settingStore.resetSettings()
      await apiStore.resetVideoSources()
      // 清空所有订阅
      const subscriptionStore = useSubscriptionStore.getState()
      for (const sub of [...subscriptionStore.subscriptions]) {
        subscriptionStore.removeSubscription(sub.id)
      }
      toast.success('已恢复默认配置')
    } catch (error) {
      console.error('Restore default error:', error)
      toast.error('恢复默认配置失败')
    }
  }

  return {
    exportConfig,
    exportConfigToText,
    importConfig,
    importConfigFromText,
    importConfigFromURL,
    restoreDefault,
  }
}
