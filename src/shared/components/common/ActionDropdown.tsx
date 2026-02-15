import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { type ReactNode } from 'react'
import { cn } from '@/shared/lib'

export interface DropdownItem {
  label: string
  onClick?: () => void
  type?: 'item' | 'sub'
  children?: DropdownItem[]
  className?: string
}

interface ActionDropdownProps {
  label: string | ReactNode
  items: DropdownItem[]
  align?: 'start' | 'end' | 'center'
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon' | 'xs'
  buttonClassName?: string
}

export default function ActionDropdown({
  label,
  items,
  align = 'end',
  buttonSize = 'default',
  buttonClassName,
}: ActionDropdownProps) {
  const renderItem = (item: DropdownItem, index: number) => {
    if (item.type === 'sub' && item.children) {
      return (
        <DropdownMenuSub key={index}>
          <DropdownMenuSubTrigger className="cursor-pointer px-2">
            {item.label}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {item.children.map((child, childIndex) => renderItem(child, childIndex))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      )
    }

    return (
      <DropdownMenuItem
        key={index}
        className={`px-2 hover:cursor-pointer ${item.className || ''}`}
        onClick={item.onClick}
      >
        {item.label}
      </DropdownMenuItem>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={buttonSize} className={cn(buttonClassName)}>
          {label} <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44" align={align}>
        <DropdownMenuGroup>{items.map((item, index) => renderItem(item, index))}</DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
