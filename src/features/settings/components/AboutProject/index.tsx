import { OkiLogo } from '@/shared/components/icons'
import { ArrowUpRight, Github, History } from 'lucide-react'
import { useVersionStore } from '@/shared/store/versionStore'
import { SettingsPageShell, SettingsSection } from '../common'

export default function AboutProject() {
  const { setShowUpdateModal, currentVersion, updateHistory } = useVersionStore()
  const latestUpdate = updateHistory[0]

  return (
    <SettingsPageShell title="关于 Ouonnki TV" description="发现喜欢的内容，享受纯粹的观看体验。">
      <section
        aria-label="项目信息"
        className="border-border bg-background/50 flex flex-wrap items-center gap-5 rounded-xl border p-5 md:p-6"
      >
        <OkiLogo size={64} className="shrink-0" />
        <div className="min-w-0 flex-1 basis-48 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold tracking-tight">Ouonnki TV</h3>
            <span className="text-muted-foreground bg-muted rounded-md px-2 py-0.5 font-mono text-xs">
              v{currentVersion}
            </span>
          </div>
          <p className="text-muted-foreground text-sm leading-6">
            一个开源的流媒体聚合应用。连接多个内容来源，让搜索、收藏与连续观看更简单。
          </p>
        </div>
      </section>

      <SettingsSection title="版本与资源" description="了解更新内容，或参与项目建设。">
        <div className="divide-border divide-y">
          <button
            type="button"
            onClick={() => setShowUpdateModal(true)}
            className="hover:bg-muted/40 focus-visible:ring-ring flex w-full items-center gap-3 rounded-lg px-3 py-4 text-left transition-colors outline-none focus-visible:ring-2"
          >
            <History aria-hidden="true" className="text-muted-foreground size-5 shrink-0" />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-medium">更新日志</p>
              <p className="text-muted-foreground text-xs leading-5">
                {latestUpdate
                  ? `最近更新 ${latestUpdate.date} · ${latestUpdate.title}`
                  : '查看版本迭代记录'}
              </p>
            </div>
            <ArrowUpRight aria-hidden="true" className="text-muted-foreground size-4 shrink-0" />
          </button>
          <a
            href="https://github.com/ouonnki/OuonnkiTV"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:bg-muted/40 focus-visible:ring-ring flex items-center gap-3 rounded-lg px-3 py-4 transition-colors outline-none focus-visible:ring-2"
          >
            <Github aria-hidden="true" className="text-muted-foreground size-5 shrink-0" />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-medium">
                GitHub 仓库<span className="sr-only">（在新标签页打开）</span>
              </p>
              <p className="text-muted-foreground text-xs leading-5">
                查看源码、反馈问题，或为项目贡献想法。
              </p>
            </div>
            <ArrowUpRight aria-hidden="true" className="text-muted-foreground size-4 shrink-0" />
          </a>
        </div>
      </SettingsSection>
      <footer className="text-muted-foreground border-border border-t pt-5 text-xs">
        © {new Date().getFullYear()} Ouonnki TV · 为更好的观影体验而构建
      </footer>
    </SettingsPageShell>
  )
}
