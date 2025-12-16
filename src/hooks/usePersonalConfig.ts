import { useSettingStore } from '@/store/settingStore'
import { useApiStore } from '@/store/apiStore'
import { toast } from 'sonner'
import dayjs from 'dayjs'
import { type VideoApi } from '@/types'

interface PersonalConfig {
  settings: {
    network: ReturnType<typeof useSettingStore.getState>['network']
    search: ReturnType<typeof useSettingStore.getState>['search']
    playback: ReturnType<typeof useSettingStore.getState>['playback']
    system: ReturnType<typeof useSettingStore.getState>['system']
  }
  videoSources: VideoApi[]
  meta: {
    version: string
    exportDate: string
  }
}

export const usePersonalConfig = () => {
  const settingStore = useSettingStore()
  const apiStore = useApiStore()

  const exportConfig = () => {
    try {
      const config: PersonalConfig = {
        settings: {
          network: settingStore.network,
          search: settingStore.search,
          playback: settingStore.playback,
          system: settingStore.system,
        },
        videoSources: apiStore.videoAPIs,
        meta: {
          version: '1.0',
          exportDate: new Date().toISOString(),
        },
      }

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
      const config: PersonalConfig = {
        settings: {
          network: settingStore.network,
          search: settingStore.search,
          playback: settingStore.playback,
          system: settingStore.system,
        },
        videoSources: apiStore.videoAPIs,
        meta: {
          version: '1.0',
          exportDate: new Date().toISOString(),
        },
      }

      const data = JSON.stringify(config, null, 2)
      await navigator.clipboard.writeText(data)
      toast.success('配置已复制到剪贴板')
    } catch (error) {
      console.error('Export text config error:', error)
      toast.error('复制失败，请重试')
    }
  }

  const validateAndRestore = (config: PersonalConfig) => {
    // Basic validation
    if (!config.settings || !config.videoSources) {
      throw new Error('Invalid config format')
    }

    // Restore settings
    if (config.settings.network) settingStore.setNetworkSettings(config.settings.network)
    if (config.settings.search) settingStore.setSearchSettings(config.settings.search)
    if (config.settings.playback) settingStore.setPlaybackSettings(config.settings.playback)
    if (config.settings.system) settingStore.setSystemSettings(config.settings.system)

    // Restore video sources
    apiStore.importVideoAPIs(config.videoSources)

    toast.success(`配置导入成功`)
  }

  const importConfig = async (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const content = e.target?.result as string
        const config = JSON.parse(content) as PersonalConfig
        validateAndRestore(config)
      } catch (error) {
        console.error('Import config error:', error)
        toast.error('配置导入失败：文件格式错误')
      }
    }
    reader.readAsText(file)
  }

  const importConfigFromText = (text: string) => {
    try {
      const config = JSON.parse(text) as PersonalConfig
      validateAndRestore(config)
      return true
    } catch (error) {
      console.error('Import text config error:', error)
      toast.error('配置导入失败：JSON 格式错误')
      return false
    }
  }

  const importConfigFromURL = async (url: string) => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const config = (await response.json()) as PersonalConfig
      validateAndRestore(config)
      return true
    } catch (error) {
      console.error('Import url config error:', error)
      toast.error('配置导入失败：网络请求或解析错误')
      return false
    }
  }

  const restoreDefault = async () => {
    try {
      settingStore.resetSettings()
      await apiStore.resetVideoSources()
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
