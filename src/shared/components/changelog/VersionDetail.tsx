import { Badge } from '@/shared/components/ui/badge'
import { VersionCategoryCard } from './VersionCategoryCard'

interface VersionUpdate {
  version: string
  title: string
  date: string
  features: string[]
  fixes?: string[]
  breaking?: string[]
}

interface VersionDetailProps {
  version: VersionUpdate
}

export function VersionDetail({ version }: VersionDetailProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1 px-1">
        <h3 className="text-lg font-semibold">{version.title}</h3>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Badge variant="secondary" className="text-xs font-medium">
            v{version.version}
          </Badge>
          <span>{version.date}</span>
        </div>
      </div>

      <div className="space-y-3">
        <VersionCategoryCard category="features" items={version.features} />
        <VersionCategoryCard category="fixes" items={version.fixes ?? []} />
        <VersionCategoryCard category="breaking" items={version.breaking ?? []} />
      </div>
    </div>
  )
}
