import type { ReactNode } from 'react'
import { cn } from '@/shared/lib'

interface SettingsPageShellProps {
  title: string
  description: string
  actions?: ReactNode
  badges?: ReactNode
  children: ReactNode
  showHeader?: boolean
}

interface SettingsSectionProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  headerClassName?: string
  variant?: 'card' | 'flat'
  tone?: 'slate' | 'sky' | 'emerald' | 'violet' | 'amber' | 'rose' | 'cyan'
}

interface SettingsItemProps {
  title: string
  description?: string
  control?: ReactNode
  children?: ReactNode
  className?: string
  controlClassName?: string
}

export function SettingsPageShell({
  title,
  description,
  actions,
  badges,
  children,
  showHeader = true,
}: SettingsPageShellProps) {
  if (!showHeader) {
    return <div className="space-y-6">{children}</div>
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3 px-1">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
        {badges ? <div className="mt-4 flex flex-wrap gap-2">{badges}</div> : null}
      </section>
      {children}
    </div>
  )
}

export function SettingsSection({
  title,
  description,
  icon,
  action,
  children,
  className,
  headerClassName,
  variant = 'card',
  tone = 'slate',
}: SettingsSectionProps) {
  const toneStyles = {
    slate: {
      section: '',
      line: 'from-zinc-400/28 to-transparent',
      icon: 'bg-muted/70 text-muted-foreground ring-zinc-400/20',
    },
    sky: {
      section: '',
      line: 'from-sky-500/30 to-transparent',
      icon: 'bg-muted/70 text-sky-700 dark:text-sky-300 ring-sky-500/25',
    },
    emerald: {
      section: '',
      line: 'from-emerald-500/30 to-transparent',
      icon: 'bg-muted/70 text-emerald-700 dark:text-emerald-300 ring-emerald-500/25',
    },
    violet: {
      section: '',
      line: 'from-violet-500/30 to-transparent',
      icon: 'bg-muted/70 text-violet-700 dark:text-violet-300 ring-violet-500/25',
    },
    amber: {
      section: '',
      line: 'from-amber-500/32 to-transparent',
      icon: 'bg-muted/70 text-amber-700 dark:text-amber-300 ring-amber-500/25',
    },
    rose: {
      section: '',
      line: 'from-rose-500/30 to-transparent',
      icon: 'bg-muted/70 text-rose-700 dark:text-rose-300 ring-rose-500/25',
    },
    cyan: {
      section: '',
      line: 'from-cyan-500/30 to-transparent',
      icon: 'bg-muted/70 text-cyan-700 dark:text-cyan-300 ring-cyan-500/25',
    },
  }[tone]

  return (
    <section
      className={cn(
        variant === 'card'
          ? 'bg-card/70 relative overflow-hidden rounded-xl p-4 md:p-5'
          : 'relative p-0',
        variant === 'card' ? toneStyles.section : '',
        className,
      )}
    >
      {variant === 'card' ? (
        <span
          className={cn(
            'pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r md:inset-x-5',
            toneStyles.line,
          )}
        />
      ) : null}
      <div
        className={cn(
          'mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between',
          headerClassName,
        )}
      >
        <div className="flex items-start gap-3">
          {icon ? (
            <div
              className={cn(
                'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg ring-1',
                toneStyles.icon,
              )}
            >
              {icon}
            </div>
          ) : null}
          <div className="space-y-1">
            <h2 className="text-base font-semibold md:text-lg">{title}</h2>
            {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export function SettingsItem({
  title,
  description,
  control,
  children,
  className,
  controlClassName,
}: SettingsItemProps) {
  return (
    <div
      className={cn(
        'bg-muted/35 flex flex-col gap-3 rounded-lg px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4',
        className,
      )}
    >
      <div className="space-y-1">
        <p className="text-sm font-medium md:text-base">{title}</p>
        {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
      </div>
      {control ? <div className={cn('shrink-0', controlClassName)}>{control}</div> : null}
      {children}
    </div>
  )
}
