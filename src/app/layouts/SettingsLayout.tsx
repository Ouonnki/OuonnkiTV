import { useLocation, useNavigate } from 'react-router'
import { cn } from '@/shared/lib'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { ArrowLeft, Compass, FolderCog, Info, ListVideo, Play, Settings2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { CustomAnimatedOutlet } from '@/shared/components/AnimatedOutlet'
import { animationPresets } from '@/shared/lib/animationVariants'
import { UnderlineTabs } from '@/shared/components/common/UnderlineTabs'

const settingsModules = [
  {
    id: 'source',
    name: '视频源管理',
    shortName: '视频源',
    icon: ListVideo,
    path: '/settings/source',
    description: '管理站点可用视频源，支持导入、导出、启停与参数编辑。',
    badges: ['源列表', '导入导出', '启用策略'],
    dotClass: 'bg-sky-500',
    iconClass: 'text-sky-700 dark:text-sky-300',
    badgeClass: 'border-sky-500/28 text-sky-700 dark:text-sky-300',
  },
  {
    id: 'playback',
    name: '播放设置',
    shortName: '播放',
    icon: Play,
    path: '/settings/playback',
    description: '按你的观看习惯组合播放行为与剧集展示方式。',
    badges: ['播放行为', '剧集排序', '体验优化'],
    dotClass: 'bg-violet-500',
    iconClass: 'text-violet-700 dark:text-violet-300',
    badgeClass: 'border-violet-500/28 text-violet-700 dark:text-violet-300',
  },
  {
    id: 'system',
    name: '系统设置',
    shortName: '系统',
    icon: Settings2,
    path: '/settings/system',
    description: '组合网络、搜索、主题与系统行为，统一管理应用偏好。',
    badges: ['网络', '搜索', '主题', '系统行为'],
    dotClass: 'bg-emerald-500',
    iconClass: 'text-emerald-700 dark:text-emerald-300',
    badgeClass: 'border-emerald-500/28 text-emerald-700 dark:text-emerald-300',
  },
  {
    id: 'profile',
    name: '个人配置',
    shortName: '配置',
    icon: FolderCog,
    path: '/settings/profile',
    description: '管理个人配置快照，支持导入、导出与一键恢复默认状态。',
    badges: ['配置快照', '导入导出', '恢复默认'],
    dotClass: 'bg-amber-500',
    iconClass: 'text-amber-700 dark:text-amber-300',
    badgeClass: 'border-amber-500/28 text-amber-700 dark:text-amber-300',
  },
  {
    id: 'about',
    name: '关于项目',
    shortName: '关于',
    icon: Info,
    path: '/settings/about',
    description: '查看项目概览、资源入口与版本迭代信息。',
    badges: ['项目概览', '版本信息', '资源入口'],
    showGuide: false,
    dotClass: 'bg-rose-500',
    iconClass: 'text-rose-700 dark:text-rose-300',
    badgeClass: 'border-rose-500/28 text-rose-700 dark:text-rose-300',
  },
]

/**
 * SettingsLayout - 设置页面布局
 * 带粘性页头与模块导航的子路由布局
 */
export default function SettingsLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const activeModule =
    settingsModules.find(module => location.pathname.startsWith(module.path)) || settingsModules[0]

  const tabOptions = settingsModules.map(module => ({
    key: module.id,
    label: (
      <>
        <span className={cn('inline-block size-1.5 rounded-full', module.dotClass)} />
        <span>{module.name}</span>
      </>
    ),
    indicatorClassName: module.dotClass,
  }))

  return (
    <div className="min-h-[90vh] pb-8">
      <header className="border-border bg-sidebar/80 sticky top-0 z-20 border-b backdrop-blur-md">
        <div className="py-1.5 md:py-3">
          <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 px-2 text-xs md:h-9 md:px-3 md:text-sm"
              onClick={() => navigate('/')}
            >
              <ArrowLeft />
              返回
            </Button>

            <div className="min-w-0 flex-1 text-right md:flex-none md:text-left">
              <h1 className="truncate text-base font-bold md:text-xl">设置中心</h1>
              <p className="text-muted-foreground hidden text-xs md:block">管理播放与系统偏好</p>
            </div>

            <div className="order-3 w-full md:order-none md:ml-auto md:flex md:w-[min(58vw,760px)] md:justify-end md:pr-3">
              <UnderlineTabs
                options={tabOptions}
                activeKey={activeModule.id}
                onChange={nextId => {
                  const targetModule = settingsModules.find(module => module.id === nextId)
                  if (targetModule && targetModule.path !== location.pathname) {
                    navigate(targetModule.path)
                  }
                }}
                layoutId="settings-tab-underline"
                listClassName="border-b border-transparent"
                leftEdgeClassName="from-sidebar via-sidebar/72 to-transparent"
                rightEdgeClassName="from-sidebar via-sidebar/72 to-transparent"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-0 pt-2 md:px-4 md:pt-4">
        <AnimatePresence initial={false} mode="wait">
          {activeModule.showGuide !== false ? (
            <motion.section
              key={`guide-${activeModule.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
              className="from-muted/35 to-muted/20 border-border/70 mb-4 rounded-xl border border-dashed bg-gradient-to-r px-3 py-2.5 md:px-4 md:py-3"
            >
              <div className="flex items-start gap-2.5 md:gap-3">
                <div className="bg-background text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-lg border md:size-8">
                  <Compass className={cn('size-3.5 md:size-4', activeModule.iconClass)} />
                </div>

                <div className="min-w-0 flex-1 space-y-1.5 md:space-y-2">
                  <p className="text-muted-foreground hidden text-[11px] font-medium tracking-wide uppercase md:block">
                    模块导览
                  </p>
                  <h2 className="text-sm font-semibold md:text-lg">{activeModule.name}</h2>
                  <p className="text-muted-foreground line-clamp-2 text-xs md:line-clamp-none md:text-sm">
                    {activeModule.description}
                  </p>
                  <p className="text-muted-foreground text-[11px] md:hidden">
                    {activeModule.badges.slice(0, 2).join(' · ')}
                  </p>
                  <div className="hidden flex-wrap gap-1.5 md:flex">
                    {activeModule.badges.map(label => (
                      <Badge
                        key={label}
                        variant="outline"
                        className={cn('font-normal', activeModule.badgeClass)}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>

        <CustomAnimatedOutlet variants={animationPresets.slideX} />
      </main>
    </div>
  )
}
