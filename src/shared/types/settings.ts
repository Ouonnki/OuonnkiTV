export interface SettingModule {
  id: string
  name: string
  icon: React.ReactNode
  component: React.ReactNode
}

export type SettingModuleList = SettingModule[]
