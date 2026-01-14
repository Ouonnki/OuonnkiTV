import * as React from "react"
import { cn } from '@/shared/lib/index'

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  label?: string
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-3",
}

function Spinner({ className, size = "md", label, ...props }: SpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)} {...props}>
      <div
        className={cn(
          "animate-spin rounded-full border-primary border-t-transparent",
          sizeClasses[size]
        )}
      />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  )
}

export { Spinner }
