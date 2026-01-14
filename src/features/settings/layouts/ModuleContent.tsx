import { type SettingModule } from '@/shared/types'

export default function ModuleContent({ module }: { module: SettingModule }) {
  return (
    <>
      <div className="h-fit w-full">{module.component}</div>
    </>
  )
}
