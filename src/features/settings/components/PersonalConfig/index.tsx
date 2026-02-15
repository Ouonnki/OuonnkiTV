import { ArchiveRestore, Settings2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { ConfirmModal } from '@/shared/components/common/ConfirmModal'
import ActionDropdown from '@/shared/components/common/ActionDropdown'
import { usePersonalConfig } from '@/shared/hooks/usePersonalConfig'
import { SettingsItem, SettingsPageShell, SettingsSection } from '../common'
import { TextConfigModal, URLConfigModal } from '../AboutProject/ImportConfigModal'

export default function PersonalConfig() {
  const { exportConfig, exportConfigToText, importConfig, restoreDefault } = usePersonalConfig()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [urlConfigModalOpen, setUrlConfigModalOpen] = useState(false)
  const [textConfigModalOpen, setTextConfigModalOpen] = useState(false)
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    importConfig(file)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <SettingsPageShell
      title="个人配置"
      description="导入、导出和恢复你的完整配置（设置 + 视频源）。"
      showHeader={false}
    >
      <SettingsSection
        title="配置管理"
        description="支持文件、URL、文本三种导入方式与两种导出方式。"
        icon={<Settings2 className="size-4" />}
        tone="amber"
        action={
          <ActionDropdown
            label="配置操作"
            buttonSize="sm"
            buttonClassName="h-8 px-3"
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
        }
      >
        <SettingsItem
          title="配置快照"
          description="导出的配置包含系统设置、播放设置、搜索设置与全部视频源。"
          control={
            <Badge variant="outline" className="font-normal">
              支持 JSON
            </Badge>
          }
        />
        <SettingsItem
          title="恢复默认配置"
          description="重置所有设置并清空已添加视频源。"
          control={
            <Button
              variant="destructive"
              size="sm"
              className="h-8 px-3"
              onClick={() => setConfirmRestoreOpen(true)}
            >
              <ArchiveRestore className="size-4" />
              恢复默认
            </Button>
          }
        />
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".json"
          onChange={handleFileChange}
        />
      </SettingsSection>

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
    </SettingsPageShell>
  )
}
