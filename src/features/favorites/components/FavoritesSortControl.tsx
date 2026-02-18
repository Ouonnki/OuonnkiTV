import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { FAVORITE_SORT_OPTIONS, type FavoriteSortValue } from '../constants/sort'

interface FavoritesSortControlProps {
  value: FavoriteSortValue
  onChange: (value: FavoriteSortValue) => void
}

/** 收藏排序控件 */
export function FavoritesSortControl({ value, onChange }: FavoritesSortControlProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-xs">排序</span>
      <Select value={value} onValueChange={next => onChange(next as FavoriteSortValue)}>
        <SelectTrigger
          size="sm"
          className="min-w-[150px] rounded-md bg-transparent text-xs md:min-w-[168px] md:text-sm"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {FAVORITE_SORT_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
