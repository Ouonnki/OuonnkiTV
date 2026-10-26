import { createContext, useContext, useId, type ComponentProps, type ReactNode } from 'react'
import { Input } from '@/shared/components/ui/input'
import { Switch } from '@/shared/components/ui/switch'
import { SelectTrigger } from '@/shared/components/ui/select'
import { cn } from '@/shared/lib'

interface SettingsPageShellProps {
  title: string
  description: string
  children: ReactNode
}

interface SettingsSectionProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  layout?: 'split' | 'stack'
}

interface SettingsItemProps {
  title: string
  description?: ReactNode
  control?: ReactNode
  children?: ReactNode
  className?: string
}

const SettingsControlContext = createContext<{ id?: string; 'aria-describedby'?: string }>({})

export function SettingsInput(props: ComponentProps<typeof Input>) {
  const field = useContext(SettingsControlContext)
  return <Input {...props} {...field} />
}

export function SettingsSwitch(props: ComponentProps<typeof Switch>) {
  const field = useContext(SettingsControlContext)
  return <Switch {...props} {...field} />
}

export function SettingsSelectTrigger(props: ComponentProps<typeof SelectTrigger>) {
  const field = useContext(SettingsControlContext)
  return <SelectTrigger {...props} {...field} />
}

export function SettingsPageShell({ title, description, children }: SettingsPageShellProps) {
  return (
    <div>
      <div className="mb-8 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
      <div className="space-y-8 md:space-y-10">{children}</div>
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
  layout = 'split',
}: SettingsSectionProps) {
  const headingId = useId()

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        'border-border/80 border-t pt-5',
        layout === 'split' && 'grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-8',
        className,
      )}
    >
      <div
        className={cn(
          'flex min-w-0 flex-wrap items-start justify-between gap-3',
          layout === 'stack' && 'mb-5',
        )}
      >
        <div className="min-w-0 space-y-2">
          <h3 id={headingId} className="flex items-center gap-2 text-sm font-semibold">
            {icon ? (
              <span aria-hidden="true" className="text-muted-foreground">
                {icon}
              </span>
            ) : null}
            {title}
          </h3>
          {description ? (
            <p className="text-muted-foreground text-xs leading-5">{description}</p>
          ) : null}
        </div>
        {action ? <div className="flex flex-wrap items-center gap-2">{action}</div> : null}
      </div>
      <div className="min-w-0">{children}</div>
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
  const id = useId()
  const descriptionId = description ? `${id}-description` : undefined

  return (
    <SettingsControlContext.Provider value={{ id, 'aria-describedby': descriptionId }}>
      <div
        className={cn(
          'border-border/60 flex min-w-0 flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b py-4 first:pt-0 last:border-b-0 last:pb-0',
          className,
        )}
      >
        <div className="min-w-0 flex-1 basis-48 space-y-1.5">
          <label htmlFor={id} className="text-sm leading-5 font-medium">
            {title}
          </label>
          {description ? (
            <p id={descriptionId} className="text-muted-foreground text-xs leading-5">
              {description}
            </p>
          ) : null}
        </div>
        {control ? (
          <div className="max-w-full shrink-0 has-[[data-slot=input]]:w-full has-[[data-slot=select-trigger]]:w-full sm:has-[[data-slot=input]]:w-auto sm:has-[[data-slot=select-trigger]]:w-auto">
            {control}
          </div>
        ) : null}
        {children}
      </div>
    </SettingsControlContext.Provider>
  )
}
