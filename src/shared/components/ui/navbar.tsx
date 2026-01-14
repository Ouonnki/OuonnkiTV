import * as React from 'react'
import { cn } from '@/shared/lib/index'

type NavbarProps = React.HTMLAttributes<HTMLElement>

function Navbar({ className, children, ...props }: NavbarProps) {
  return (
    <div className="h-16 w-full px-2 pt-2">
      <nav
        className={cn(
          'border-border bg-sidebar flex h-full items-center justify-between rounded-lg border px-3 shadow-sm backdrop-blur-md',
          className,
        )}
        {...props}
      >
        {children}
      </nav>
    </div>
  )
}

type NavbarBrandProps = React.HTMLAttributes<HTMLDivElement>

function NavbarBrand({ className, children, ...props }: NavbarBrandProps) {
  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      {children}
    </div>
  )
}

interface NavbarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  justify?: 'start' | 'center' | 'end'
}

function NavbarContent({ className, justify = 'start', children, ...props }: NavbarContentProps) {
  const justifyClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  }

  return (
    <div
      className={cn('flex flex-1 items-center gap-4', justifyClass[justify], className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Navbar, NavbarBrand, NavbarContent }
