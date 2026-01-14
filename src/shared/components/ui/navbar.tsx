import * as React from 'react'
import { cn } from '@/shared/lib/index'

interface NavbarProps extends React.HTMLAttributes<HTMLElement> {}

function Navbar({ className, children, ...props }: NavbarProps) {
  return (
    <nav
      className={cn(
        'border-border bg-background/80 flex h-16 w-full items-center justify-between border-b px-5 backdrop-blur-md',
        className,
      )}
      {...props}
    >
      {children}
    </nav>
  )
}

interface NavbarBrandProps extends React.HTMLAttributes<HTMLDivElement> {}

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
