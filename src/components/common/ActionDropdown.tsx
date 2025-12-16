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
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type ReactNode } from 'react'

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
}

export default function ActionDropdown({ label, items, align = 'end' }: ActionDropdownProps) {
  const renderItem = (item: DropdownItem, index: number) => {
    if (item.type === 'sub' && item.children) {
      return (
        <DropdownMenuSub key={index}>
          <DropdownMenuSubTrigger className="cursor-pointer px-2">
            {item.label}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="bg-white/10 backdrop-blur-lg">
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
        <Button variant="outline" className="bg-white/40 backdrop-blur-xl hover:bg-gray-100/50">
          {label} <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40 bg-white/10 backdrop-blur-lg" align={align}>
        <DropdownMenuGroup>{items.map((item, index) => renderItem(item, index))}</DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
