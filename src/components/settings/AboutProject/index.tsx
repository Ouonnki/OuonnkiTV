import { OkiLogo } from '@/components/icons'
import { Github, History } from 'lucide-react'
import { useVersionStore } from '@/store/versionStore'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useSettingStore } from '@/store/settingStore'
import ActionDropdown from '@/components/common/ActionDropdown'
import { usePersonalConfig } from '@/hooks/usePersonalConfig'
import { useRef, useState } from 'react'
import { URLConfigModal, TextConfigModal } from './ImportConfigModal'
import { ConfirmModal } from '@/components/common/ConfirmModal'

export default function AboutProject() {
  const currentYear = new Date().getFullYear()
  const { currentVersion, setShowUpdateModal } = useVersionStore()
  const { system, setSystemSettings } = useSettingStore()

  const { exportConfig, exportConfigToText, importConfig, restoreDefault } = usePersonalConfig()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    importConfig(file)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const [urlConfigModalOpen, setUrlConfigModalOpen] = useState(false)
  const [textConfigModalOpen, setTextConfigModalOpen] = useState(false)
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6 px-4 md:px-8">
      {/* Header Section */}
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="transition-all duration-300 hover:scale-105">
          <OkiLogo size={120} className="drop-shadow-sm" />
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-800 md:text-3xl dark:text-gray-100">
            Ouonnki TV
          </h1>
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary rounded-full px-3 py-0.5 text-xs font-medium md:text-sm">
              v{currentVersion}
            </span>
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between rounded-lg border border-gray-200 bg-white/40 p-4 transition-all hover:border-gray-300 hover:bg-white/60 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/40 dark:hover:bg-gray-800/60">
          <div className="space-y-0.5">
            <Label className="text-base text-gray-800 dark:text-gray-100">自动显示更新日志</Label>
            <p className="text-sm text-gray-500">检测到新版本时自动弹出更新说明</p>
          </div>
          <Switch
            checked={system.isUpdateLogEnabled}
            onCheckedChange={checked => setSystemSettings({ isUpdateLogEnabled: checked })}
          />
        </div>

        {/* Personal Config Section */}
        <div className="flex flex-row items-center justify-between rounded-lg border border-gray-200 bg-white/40 p-4 transition-all hover:border-gray-300 hover:bg-white/60 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/40 dark:hover:bg-gray-800/60">
          <div className="space-y-0.5">
            <Label className="text-base text-gray-800 dark:text-gray-100">个人配置管理</Label>
            <p className="text-sm text-gray-500">导入/导出设置与视频源，或恢复默认</p>
          </div>
          <ActionDropdown
            label="配置操作"
            items={[
              {
                label: '导出个人配置',
                type: 'sub',
                children: [
                  {
                    label: '导出为文件',
                    onClick: exportConfig,
                  },
                  {
                    label: '导出为文本',
                    onClick: exportConfigToText,
                  },
                ],
              },
              {
                label: '导入个人配置',
                type: 'sub',
                children: [
                  {
                    label: '从文件导入',
                    onClick: () => fileInputRef.current?.click(),
                  },
                  {
                    label: '从URL导入',
                    onClick: () => setUrlConfigModalOpen(true),
                  },
                  {
                    label: '从文本导入',
                    onClick: () => setTextConfigModalOpen(true),
                  },
                ],
              },
              {
                label: '恢复默认配置',
                className: 'text-red-600 focus:text-red-600 focus:bg-red-50',
                onClick: () => setConfirmRestoreOpen(true),
              },
            ]}
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".json"
            onChange={handleFileChange}
          />
        </div>
      </div>
      <URLConfigModal open={urlConfigModalOpen} onOpenChange={setUrlConfigModalOpen} />
      <TextConfigModal open={textConfigModalOpen} onOpenChange={setTextConfigModalOpen} />
      <ConfirmModal
        isOpen={confirmRestoreOpen}
        onClose={() => setConfirmRestoreOpen(false)}
        onConfirm={restoreDefault}
        title="确认恢复默认配置？"
        description="此操作将重置所有设置并清除所有已添加的视频源，恢复到初始默认状态。该操作无法撤销。"
        confirmText="确认恢复"
        isDestructive={true}
      />

      {/* Description Section */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white/40 p-6 text-center backdrop-blur-xl hover:shadow-sm md:text-left dark:border-gray-700 dark:bg-gray-800/40">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">关于项目</h2>
        <p className="leading-relaxed text-gray-600 dark:text-gray-300">
          Ouonnki TV 是一款精心打造的现代化流媒体聚合平台，致力于提供极致流畅、优雅纯净的观影体验。
        </p>
      </div>

      {/* Links Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <a
          href="https://github.com/ouonnki/OuonnkiTV"
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
        >
          <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white/40 p-4 backdrop-blur-xl transition-all duration-200 hover:border-gray-300 hover:bg-white/60 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/40 dark:hover:bg-gray-800/60">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-gray-200 dark:bg-gray-700 dark:group-hover:bg-gray-600">
              <Github className="h-6 w-6 text-gray-700 dark:text-gray-200" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800 dark:text-gray-100">开源地址</span>
              <span className="text-xs text-gray-500">查看源码、提交建议与贡献代码</span>
            </div>
          </div>
        </a>

        <div onClick={() => setShowUpdateModal(true)} className="group block cursor-pointer">
          <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white/40 p-4 backdrop-blur-xl transition-all duration-200 hover:border-gray-300 hover:bg-white/60 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/40 dark:hover:bg-gray-800/60">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 transition-colors group-hover:bg-orange-100 dark:bg-orange-900/30 dark:group-hover:bg-orange-900/50">
              <History className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800 dark:text-gray-100">更新日志</span>
              <span className="text-xs text-gray-500">查看版本迭代记录与新特性</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-8 flex flex-col items-center gap-2 border-t border-gray-200/50 pt-8 text-center dark:border-gray-700/50">
        <p className="text-sm text-gray-500">© {currentYear} Ouonnki TV. All rights reserved.</p>
        <p className="text-xs text-gray-400">Designed & Built with ❤️ by Ouonnki Team</p>
      </div>
    </div>
  )
}
