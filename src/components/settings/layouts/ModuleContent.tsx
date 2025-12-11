import { type SettingModule } from '@/types'

export default function ModuleContent({ module }: { module: SettingModule }) {
  return (
    <>
      <div className="h-fit w-full">{module.component}</div>
    </>
  )
}
