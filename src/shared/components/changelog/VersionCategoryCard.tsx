import { motion } from 'framer-motion'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib'
import { CATEGORY_CONFIG, type CategoryKey } from './constants'

interface VersionCategoryCardProps {
  category: CategoryKey
  items: string[]
}

const listVariants = {
  animate: {
    transition: { staggerChildren: 0.04, delayChildren: 0.1 },
  },
}

const itemVariants = {
  initial: { opacity: 0, x: -12 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
}

export function VersionCategoryCard({ category, items }: VersionCategoryCardProps) {
  if (items.length === 0) return null

  const config = CATEGORY_CONFIG[category]
  const Icon = config.icon

  return (
    <div className="bg-muted/35 relative overflow-hidden rounded-xl px-4 py-3">
      <span
        className={cn(
          'pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r',
          config.line,
        )}
      />

      <div className="mb-2.5 flex items-center gap-2">
        <Icon className={cn('size-4 shrink-0', config.text)} />
        <h4 className={cn('text-sm font-semibold', config.text)}>{config.title}</h4>
        <Badge variant="secondary" className="ml-auto text-xs font-normal">
          {items.length}
        </Badge>
      </div>

      <motion.ul
        className="space-y-1.5"
        variants={listVariants}
        initial="initial"
        animate="animate"
      >
        {items.map((item, index) => (
          <motion.li
            key={index}
            variants={itemVariants}
            className="flex items-start gap-2 text-sm"
          >
            <span className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', config.dot)} />
            <span className="text-foreground leading-relaxed">{item}</span>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  )
}
