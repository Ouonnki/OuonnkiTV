import NetworkSettings from '../components/NetworkSettings'
import SearchSettings from '../components/SearchSettings'
import ThemeSettings from '../components/ThemeSettings'

/**
 * SystemSettings - 系统设置页
 * 合并网络、搜索、主题设置
 */
export default function SystemSettings() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-xl font-bold">网络设置</h2>
        <NetworkSettings />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">搜索设置</h2>
        <SearchSettings />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">主题设置</h2>
        <ThemeSettings />
      </section>
    </div>
  )
}
