import { Link } from 'react-router'
import { VideoCameraSlash, WarningCircle } from '@phosphor-icons/react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

interface DetailStateAction {
  label: string
  to?: string
  onClick?: () => void
  variant?: 'default' | 'secondary' | 'outline' | 'ghost'
}

interface DetailStatePanelProps {
  mode: 'error' | 'empty'
  title: string
  description: string
  tag: string
  primaryAction?: DetailStateAction
  secondaryAction?: DetailStateAction
  compact?: boolean
  className?: string
}

export function DetailStatePanel({
  mode,
  title,
  description,
  tag,
  primaryAction,
  secondaryAction,
  compact = false,
  className,
}: DetailStatePanelProps) {
  const iconClassName = mode === 'error' ? 'text-red-500/80' : 'text-foreground/70'
  const iconSize = compact ? 80 : 128

  const renderAction = (action: DetailStateAction, key: string) => {
    const variant = action.variant || (key === 'primary' ? 'secondary' : 'ghost')

    if (action.to) {
      return (
        <Button key={key} asChild size="sm" variant={variant} className="h-8 rounded-full px-3.5">
          <Link to={action.to}>{action.label}</Link>
        </Button>
      )
    }

    return (
      <Button key={key} size="sm" variant={variant} className="h-8 rounded-full px-3.5" onClick={action.onClick}>
        {action.label}
      </Button>
    )
  }

  return (
    <section
      className={cn(
        'flex w-full flex-col items-center justify-center gap-4 text-center',
        compact ? 'min-h-[280px] py-4' : 'min-h-[60vh] py-6',
        className,
      )}
    >
      {mode === 'error' ? (
        <WarningCircle size={iconSize} weight="duotone" aria-hidden="true" className={iconClassName} />
      ) : (
        <VideoCameraSlash size={iconSize} weight="duotone" aria-hidden="true" className={iconClassName} />
      )}

      <div className="space-y-2">
        <p className="text-muted-foreground/70 text-[11px] tracking-[0.12em] uppercase">{tag}</p>
        <h2 className={cn('text-foreground/88 font-medium', compact ? 'text-sm' : 'text-[15px] md:text-base')}>
          {title}
        </h2>
        <p
          className={cn(
            'text-muted-foreground mx-auto max-w-md leading-6',
            compact ? 'text-xs md:text-sm' : 'text-xs md:text-sm',
          )}
        >
          {description}
        </p>
      </div>

      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {primaryAction ? renderAction(primaryAction, 'primary') : null}
          {secondaryAction ? renderAction(secondaryAction, 'secondary') : null}
        </div>
      )}
    </section>
  )
}
