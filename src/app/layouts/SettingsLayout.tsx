import { NavLink, useLocation, useNavigate } from 'react-router'
import { cn } from '@/shared/lib'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { ArrowLeft, Compass, FolderCog, Info, ListVideo, Play, Settings2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { CustomAnimatedOutlet } from '@/shared/components/AnimatedOutlet'
import { animationPresets } from '@/shared/lib/animationVariants'

const settingsModules = [
  {
    id: 'source',
    name: '视频源管理',
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

  const renderTabs = (className?: string) => (
    <div
      className={cn(
        'bg-muted relative inline-flex min-w-max items-center rounded-full p-1',
        className,
      )}
    >
      {settingsModules.map(module => {
        const isActive = module.id === activeModule.id

        return (
          <NavLink
            key={module.id}
            to={module.path}
            className={cn(
              'relative z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary/80',
            )}
          >
            <module.icon className={cn('size-3.5', isActive ? module.iconClass : '')} />
            <span className={cn('inline-block size-1.5 rounded-full', module.dotClass)} />
            <span>{module.name}</span>
            {isActive ? (
              <motion.div
                layoutId="settings-tab-indicator"
                className="bg-background absolute inset-0 -z-10 rounded-full shadow-sm"
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                }}
              />
            ) : null}
          </NavLink>
        )
      })}
    </div>
  )

  return (
    <div className="min-h-[90vh] pb-8">
      <header className="border-border bg-sidebar/80 sticky top-0 z-20 border-b backdrop-blur-md">
        <div className="py-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" className="shrink-0" onClick={() => navigate('/')}>
              <ArrowLeft />
              返回
            </Button>

            <div className="min-w-0">
              <h1 className="truncate text-base font-bold md:text-lg">设置中心</h1>
              <p className="text-muted-foreground text-xs">管理播放与系统偏好</p>
            </div>

            <div className="order-3 w-full overflow-x-auto pb-0.5 md:order-none md:ml-auto md:w-auto md:overflow-visible md:pb-0">
              {renderTabs()}
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-3 pt-4 md:px-4">
        {activeModule.showGuide !== false ? (
          <section className="from-muted/35 to-muted/20 border-border/70 mb-4 rounded-xl border border-dashed bg-gradient-to-r px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="bg-background text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-lg border">
                <Compass className={cn('size-4', activeModule.iconClass)} />
              </div>

              <div className="space-y-2">
                <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                  模块导览
                </p>
                <h2 className="text-base font-semibold md:text-lg">{activeModule.name}</h2>
                <p className="text-muted-foreground text-sm">{activeModule.description}</p>
                <div className="flex flex-wrap gap-1.5">
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
          </section>
        ) : null}

        <CustomAnimatedOutlet variants={animationPresets.slideX} />
      </main>
    </div>
  )
}
