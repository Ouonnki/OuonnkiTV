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
    <section
      aria-label={config.title}
      className="border-border border-t pt-4 first:border-t-0 first:pt-0"
    >
      <div className="mb-2.5 flex items-center gap-2">
        <Icon className={cn('size-4 shrink-0', config.text)} />
        <h4 className="text-sm font-semibold">{config.title}</h4>
        <Badge variant="outline" className="ml-auto text-xs font-normal">
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
          <motion.li key={index} variants={itemVariants} className="flex items-start gap-2 text-sm">
            <span
              aria-hidden="true"
              className="bg-muted-foreground/40 mt-2 size-1 shrink-0 rounded-full"
            />
            <span className="text-foreground leading-relaxed">{item}</span>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  )
}
