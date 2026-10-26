import {
  ArchiveRestore,
  Copy,
  Download,
  FileUp,
  Link,
  ShieldCheck,
  Text,
  Upload,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { ConfirmModal } from '@/shared/components/common/ConfirmModal'
import { usePersonalConfig } from '@/shared/hooks/usePersonalConfig'
import { SettingsPageShell, SettingsSection } from '../common'
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
    void importConfig(file)
    event.target.value = ''
  }

  return (
    <SettingsPageShell
      title="个人配置"
      description="备份、迁移或恢复你的偏好，在不同设备上延续熟悉的体验。"
    >
      <SettingsSection
        title="备份与迁移"
        description="配置包含播放、网络、搜索与系统设置，以及视频源和订阅。"
        icon={<ShieldCheck className="size-4" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="border-border bg-background/50 flex flex-col rounded-xl border p-4 sm:p-5">
            <Download aria-hidden="true" className="text-muted-foreground mb-4 size-5" />
            <h4 className="text-sm font-medium">导出配置</h4>
            <p className="text-muted-foreground mt-2 mb-5 text-xs leading-5">
              保存一份 JSON 备份，或复制文本用于迁移。配置可能包含 Token，请妥善保管。
            </p>
            <div className="mt-auto flex flex-wrap gap-2">
              <Button size="sm" onClick={exportConfig}>
                <Download />
                下载文件
              </Button>
              <Button size="sm" variant="outline" onClick={exportConfigToText}>
                <Copy />
                复制文本
              </Button>
            </div>
          </div>
          <div className="border-border bg-background/50 flex flex-col rounded-xl border p-4 sm:p-5">
            <Upload aria-hidden="true" className="text-muted-foreground mb-4 size-5" />
            <h4 className="text-sm font-medium">导入配置</h4>
            <p className="text-muted-foreground mt-2 mb-5 text-xs leading-5">
              从已有备份恢复。导入会更新配置中的对应设置，建议先备份当前配置。
            </p>
            <div className="mt-auto flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <FileUp />
                选择文件
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setUrlConfigModalOpen(true)}>
                <Link />
                URL
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setTextConfigModalOpen(true)}>
                <Text />
                文本
              </Button>
            </div>
          </div>
        </div>
        <input
          aria-label="导入配置文件"
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".json,application/json"
          onChange={handleFileChange}
        />
      </SettingsSection>

      <SettingsSection
        title="恢复默认"
        description="从初始状态重新开始。"
        icon={<ArchiveRestore className="size-4" />}
      >
        <div className="border-destructive/20 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 sm:p-5">
          <div className="min-w-0 flex-1 basis-56 space-y-1.5">
            <h4 className="text-sm font-medium">重置应用配置</h4>
            <p className="text-muted-foreground text-xs leading-5">
              重置偏好、视频源与订阅，并重新载入部署提供的默认源和订阅。此操作无法撤销。
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmRestoreOpen(true)}
          >
            恢复默认配置
          </Button>
        </div>
      </SettingsSection>

      <URLConfigModal open={urlConfigModalOpen} onOpenChange={setUrlConfigModalOpen} />
      <TextConfigModal open={textConfigModalOpen} onOpenChange={setTextConfigModalOpen} />
      <ConfirmModal
        isOpen={confirmRestoreOpen}
        onClose={() => setConfirmRestoreOpen(false)}
        onConfirm={restoreDefault}
        title="确认恢复默认配置？"
        description="所有偏好将重置，当前视频源与订阅将被部署提供的默认内容替换。此操作无法撤销，建议先导出备份。"
        confirmText="确认恢复"
        isDestructive
      />
    </SettingsPageShell>
  )
}
