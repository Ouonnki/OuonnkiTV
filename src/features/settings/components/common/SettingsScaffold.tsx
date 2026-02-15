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
  variant?: 'card' | 'flat'
}

interface SettingsItemProps {
  title: string
  description?: string
  control?: ReactNode
  children?: ReactNode
  className?: string
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
  variant = 'card',
}: SettingsSectionProps) {
  return (
    <section
      className={cn(variant === 'card' ? 'bg-card/70 rounded-xl p-4 md:p-5' : 'p-0', className)}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          {icon ? (
            <div className="bg-muted text-muted-foreground mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg">
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
      {control ? <div className="shrink-0">{control}</div> : null}
      {children}
    </div>
  )
}
