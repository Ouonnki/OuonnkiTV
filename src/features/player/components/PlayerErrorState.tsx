import { Link } from 'react-router'
import { VideoCameraSlash } from '@phosphor-icons/react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

interface PlayerErrorStateAction {
  label: string
  to?: string
  onClick?: () => void
  variant?: 'default' | 'secondary' | 'outline' | 'ghost'
}

interface PlayerErrorStateProps {
  title: string
  description: string
  tag: string
  primaryAction: PlayerErrorStateAction
  secondaryAction?: PlayerErrorStateAction
  className?: string
}

export function PlayerErrorState({
  title,
  description,
  tag,
  primaryAction,
  secondaryAction,
  className,
}: PlayerErrorStateProps) {
  const renderAction = (action: PlayerErrorStateAction, key: string) => {
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
    <div
      className={cn(
        'mx-auto flex min-h-[60vh] w-full max-w-5xl items-center justify-center px-4 py-6 md:px-6',
        className,
      )}
    >
      <section className="w-full max-w-lg">
        <div className="flex flex-col items-center gap-4 text-center">
          <VideoCameraSlash
            weight="duotone"
            className="size-28 text-foreground/68 md:size-32"
            aria-hidden="true"
          />

          <div className="space-y-2">
            <p className="text-muted-foreground/70 text-[11px] tracking-[0.12em] uppercase">{tag}</p>
            <h2 className="text-foreground/88 text-[15px] font-medium md:text-base">{title}</h2>
            <p className="text-muted-foreground mx-auto max-w-md text-xs leading-6 md:text-sm">{description}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {renderAction(primaryAction, 'primary')}
            {secondaryAction ? renderAction(secondaryAction, 'secondary') : null}
          </div>
        </div>
      </section>
    </div>
  )
}
