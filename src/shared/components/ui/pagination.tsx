import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"

import { cn } from '@/shared/lib/index'
import { Button } from '@/shared/components/ui/button'

interface PaginationProps {
  total: number
  initialPage?: number
  page?: number
  onChange?: (page: number) => void
  showControls?: boolean
  size?: "sm" | "default" | "lg"
  className?: string
  siblings?: number
}

function Pagination({
  total,
  initialPage = 1,
  page: controlledPage,
  onChange,
  showControls = true,
  size = "default",
  className,
  siblings = 1,
}: PaginationProps) {
  const [uncontrolledPage, setUncontrolledPage] = React.useState(initialPage)
  const isControlled = controlledPage !== undefined
  const currentPage = isControlled ? controlledPage : uncontrolledPage

  const setPage = React.useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > total) return
      if (!isControlled) {
        setUncontrolledPage(newPage)
      }
      onChange?.(newPage)
    },
    [total, isControlled, onChange]
  )

  // Generate page numbers to display
  const getPageNumbers = React.useCallback(() => {
    const pages: (number | "ellipsis")[] = []
    const totalPageNumbers = siblings * 2 + 3 // siblings on each side + current + 2 boundaries

    if (total <= totalPageNumbers + 2) {
      // Show all pages
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      const leftSiblingIndex = Math.max(currentPage - siblings, 2)
      const rightSiblingIndex = Math.min(currentPage + siblings, total - 1)

      const showLeftEllipsis = leftSiblingIndex > 2
      const showRightEllipsis = rightSiblingIndex < total - 1

      if (showLeftEllipsis) {
        pages.push("ellipsis")
      }

      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
        if (i !== 1 && i !== total) {
          pages.push(i)
        }
      }

      if (showRightEllipsis) {
        pages.push("ellipsis")
      }

      // Always show last page
      if (total > 1) {
        pages.push(total)
      }
    }

    return pages
  }, [currentPage, total, siblings])

  const pages = getPageNumbers()
  const iconSize = size === "sm" ? 14 : size === "lg" ? 20 : 16

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
    >
      <ul className="flex flex-row items-center gap-1">
        {showControls && (
          <li>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full",
                size === "sm" && "h-8 w-8",
                size === "lg" && "h-12 w-12"
              )}
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              aria-label="Go to previous page"
            >
              <ChevronLeftIcon size={iconSize} />
            </Button>
          </li>
        )}

        {pages.map((pageNum, index) => (
          <li key={pageNum === "ellipsis" ? `ellipsis-${index}` : pageNum}>
            {pageNum === "ellipsis" ? (
              <span
                className={cn(
                  "flex items-center justify-center",
                  size === "sm" && "h-8 w-8",
                  size === "default" && "h-9 w-9",
                  size === "lg" && "h-12 w-12"
                )}
              >
                <MoreHorizontalIcon size={iconSize} className="text-muted-foreground" />
              </span>
            ) : (
              <Button
                variant={currentPage === pageNum ? "default" : "ghost"}
                size="icon"
                className={cn(
                  "rounded-full",
                  size === "sm" && "h-8 w-8",
                  size === "lg" && "h-12 w-12"
                )}
                onClick={() => setPage(pageNum)}
                aria-label={`Go to page ${pageNum}`}
                aria-current={currentPage === pageNum ? "page" : undefined}
              >
                {pageNum}
              </Button>
            )}
          </li>
        ))}

        {showControls && (
          <li>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full",
                size === "sm" && "h-8 w-8",
                size === "lg" && "h-12 w-12"
              )}
              disabled={currentPage === total}
              onClick={() => setPage(currentPage + 1)}
              aria-label="Go to next page"
            >
              <ChevronRightIcon size={iconSize} />
            </Button>
          </li>
        )}
      </ul>
    </nav>
  )
}

export { Pagination }
