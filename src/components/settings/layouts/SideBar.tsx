import { type SettingModuleList } from '@/types'
import { motion } from 'framer-motion'
import { cn } from '@/utils'

export default function SideBar({
  activeId,
  modules,
  onSelect,
  className,
}: {
  activeId: string
  modules: SettingModuleList
  onSelect: (id: string) => void
  className?: string
}) {
  return (
    <div className={cn(`relative flex h-full w-full flex-col gap-3`, className)}>
      {modules.map(module => (
        <div
          key={module.id}
          className={`relative z-10 flex h-12 cursor-pointer items-center gap-2 rounded-lg p-3 transition-colors duration-300 ${
            activeId === module.id ? 'text-white' : 'text-gray-500 hover:text-gray-700'
          } ${module.id === 'about_project' ? 'md:mt-auto' : ''}`}
          onClick={() => onSelect(module.id)}
        >
          {activeId === module.id && (
            <motion.div
              layoutId="sidebar-active-bg"
              className="absolute inset-0 -z-10 rounded-lg bg-zinc-600/80 shadow-xl/30 shadow-zinc-900 backdrop-blur-xl"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{module.icon}</span>
          <h2 className="relative z-10 font-medium">{module.name}</h2>
        </div>
      ))}
    </div>
  )
}
