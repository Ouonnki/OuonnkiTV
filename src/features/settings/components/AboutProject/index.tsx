import { OkiLogo } from '@/shared/components/icons'
import { Badge } from '@/shared/components/ui/badge'
import { Github, History, Sparkles } from 'lucide-react'
import { useVersionStore } from '@/shared/store/versionStore'
import { SettingsPageShell, SettingsSection } from '../common'

export default function AboutProject() {
  const currentYear = new Date().getFullYear()
  const { setShowUpdateModal, currentVersion, updateHistory } = useVersionStore()
  const latestUpdate = updateHistory[0]

  return (
    <SettingsPageShell
      title="关于项目"
      description="项目概览、版本信息与资源入口。"
      showHeader={false}
    >
      <section className="border-border/70 bg-card/70 relative overflow-hidden rounded-2xl border p-5 md:p-6">
        <div className="bg-primary/10 pointer-events-none absolute -top-16 -right-16 size-44 rounded-full blur-3xl" />

        <div className="relative space-y-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-background ring-border/60 flex size-18 shrink-0 items-center justify-center rounded-2xl ring-1">
                <OkiLogo size={56} className="drop-shadow-sm" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight md:text-2xl">Ouonnki TV</h2>
                <p className="text-muted-foreground text-sm">
                  面向高频观影场景的流媒体聚合应用，强调连续性与模块化体验。
                </p>
              </div>
            </div>

            <div className="hidden flex-wrap gap-2 md:flex">
              <Badge variant="outline">当前版本 v{currentVersion}</Badge>
              <Badge variant="outline">累计发布 {updateHistory.length} 个版本</Badge>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="bg-muted/35 rounded-xl px-4 py-3">
              <p className="text-muted-foreground text-xs">最近版本</p>
              <p className="mt-1 truncate text-sm font-semibold">
                {latestUpdate ? `v${currentVersion} · ${latestUpdate.title}` : `v${currentVersion}`}
              </p>
            </div>
            <div className="bg-muted/35 rounded-xl px-4 py-3">
              <p className="text-muted-foreground text-xs">累计发布版本</p>
              <p className="mt-1 text-base font-semibold">{updateHistory.length} 个版本</p>
            </div>
            <div className="bg-muted/35 rounded-xl px-4 py-3">
              <p className="text-muted-foreground text-xs">最近更新日期</p>
              <p className="mt-1 text-base font-semibold">{latestUpdate?.date ?? '-'}</p>
            </div>
          </div>
        </div>
      </section>

      <SettingsSection title="项目资源" description="查看仓库代码与版本更新记录。" tone="violet">
        <div className="grid gap-3 md:grid-cols-2">
          <a
            href="https://github.com/ouonnki/OuonnkiTV"
            target="_blank"
            rel="noopener noreferrer"
            className="border-border/70 bg-muted/35 hover:bg-muted/55 rounded-xl border px-4 py-4 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-background flex size-10 items-center justify-center rounded-lg">
                <Github className="size-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold">项目仓库</p>
                <p className="text-muted-foreground text-xs">查看源码与开发进展，欢迎点个 Star 支持</p>
              </div>
            </div>
          </a>

          <button
            type="button"
            onClick={() => setShowUpdateModal(true)}
            className="border-border/70 bg-muted/35 hover:bg-muted/55 rounded-xl border px-4 py-4 text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-background flex size-10 items-center justify-center rounded-lg">
                <History className="size-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold">版本日志</p>
                <p className="text-muted-foreground text-xs">查看每次迭代内容</p>
              </div>
            </div>
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="项目理念" description="高效交互、美观界面与稳定播放并重。" tone="cyan">
        <div className="bg-muted/30 rounded-xl p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="text-muted-foreground size-4" />
            <p className="text-sm font-medium">设计方向</p>
          </div>
          <p className="text-muted-foreground text-sm leading-6">
            项目持续围绕高效的 UX 交互、美观一致的 UI 设计与稳定流畅的播放体验迭代，确保功能扩展时依然保持易用、清晰和可靠。
          </p>
        </div>
      </SettingsSection>

      <footer className="border-border/70 text-muted-foreground mt-1 border-t pt-4 text-center text-sm">
        © {currentYear} Ouonnki TV
      </footer>
    </SettingsPageShell>
  )
}
