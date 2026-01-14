import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface VersionUpdate {
  version: string
  title: string
  date: string
  features: string[]
  fixes?: string[]
  breaking?: string[]
}

interface VersionState {
  // 当前版本
  currentVersion: string
  // 最后查看的版本
  lastViewedVersion: string
  // 是否显示更新弹窗
  showUpdateModal: boolean
  // 更新历史
  updateHistory: VersionUpdate[]
}

interface VersionActions {
  // 设置当前版本
  setCurrentVersion: (version: string) => void
  // 标记版本已查看
  markVersionAsViewed: (version: string) => void
  // 显示/隐藏更新弹窗
  setShowUpdateModal: (show: boolean) => void
  // 检查是否有新版本
  hasNewVersion: () => boolean
  // 获取最新的更新信息
  getLatestUpdate: () => VersionUpdate | null
}

type VersionStore = VersionState & VersionActions

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return date.toLocaleDateString('zh-CN', options)
}

// 版本更新历史
const VERSION_UPDATES: VersionUpdate[] = [
  {
    version: '1.3.1',
    title: '个人配置管理',
    date: formatDate('2025-12-16'),
    features: [
      '新增个人配置管理功能，支持一键导出/导入完整配置（设置 + 视频源）',
      '支持多种导入方式：本地 JSON 文件、剪贴板文本、远程 URL 链接',
      '新增「恢复默认配置」功能，可快速重置系统状态',
    ],
    fixes: ['优化配置状态管理逻辑，统一接口调用'],
  },
  {
    version: '1.3.0',
    title: '播放器升级与访问控制',
    date: formatDate('2025-12-16'),
    features: [
      '全新播放器内核：迁移至 Artplayer + hls.js，播放体验更流畅',
      '新增广告过滤功能：自动过滤切片广告，提升观看体验',
      '新增站点访问密码：支持设置全局访问密码，保护私有部署',
      '视频源管理升级：支持完整的增删改查及导入导出功能',
      '部署方式扩展：新增 Cloudflare Pages 和 Netlify 部署支持',
    ],
    fixes: [
      '重构 API 服务，支持请求并发控制',
      '优化设置页面 UI 与交互体验',
      '统一代理服务逻辑，移除外部依赖',
    ],
  },
  {
    version: '1.2.6',
    title: '配置简化与搜索修复',
    date: formatDate('2025-11-21'),
    features: [
      '简化部署配置：合并环境变量文件，只需复制 .env.example 为 .env 即可',
      '完善部署文档：Docker 部署步骤更清晰，说明更详细',
      '优化代理服务：统一了不同部署方式的请求处理逻辑',
    ],
    fixes: ['修复 Firefox 浏览器下搜索结果为 0 的问题', '改进请求超时和错误处理，提升稳定性'],
    breaking: ['⚠️ Docker 用户请重新构建镜像以应用修复：docker-compose up -d --build'],
  },
  {
    version: '1.2.5',
    title: '搜索缓存与播放体验升级',
    date: formatDate('2025-11-04'),
    features: [
      '搜索结果缓存 + 轻量过期清理：显著减少重复请求，响应更快',
      '集数选择支持正序/倒序与集名展示，播放列表与导航更顺手',
      '详情页动效，移动端补充导演/演员信息，信息层次更清晰',
      '优化详情页与设置弹窗布局，移动端可用性提升',
      '新增视口检测与提示组件，交互反馈更及时',
      '更新站点图标与清单，PWA 展示更统一',
    ],
    fixes: [
      '修复极端场景下循环导致的视频无法播放',
      '调整集数网格在不同屏幕的列数与间距',
      '设置页在多设备下的排版兼容性提升',
      '搜索请求加入更合理的超时与降级策略，弱网更稳',
      '修复部分设备上的图标模糊/缺失',
    ],
    breaking: [],
  },
  {
    version: '1.2.4',
    title: '分页功能上线',
    date: formatDate('2025-09-18'),
    features: ['添加分页功能，优化搜索结果展示和加载体验'],
    fixes: [],
    breaking: [],
  },
  {
    version: '1.2.3',
    title: '样式优化/Docker部署',
    date: formatDate('2025-09-16'),
    features: [
      '优化搜索结果页面视觉效果，添加图片懒加载',
      '导入过程自动进行 JSON 格式与字段校验，提供清晰错误提示',
      '添加自动同步主仓库',
    ],
    fixes: ['修复闪屏问题', '修复 Docker 部署时部分环境变量未生效的问题'],
    breaking: ['重构历史观看记录数据结构，旧数据将被清除'],
  },
  {
    version: '1.2.2',
    title: '新增视频源导入',
    date: formatDate('2025-08-31'),
    features: [
      '新增批量视频源导入功能：支持「本地文件 / JSON 文本 / URL」三种方式',
      '导入过程自动进行 JSON 格式与字段校验，提供清晰错误提示',
      '自动去重：已存在的视频源不会重复添加',
      '导入结果统计与 Toast 通知（成功数 / 失败数）',
      '支持通过环境变量 VITE_INITIAL_VIDEO_SOURCES 预加载初始视频源',
    ],
    fixes: ['导入弹窗交互细节优化，减少不必要的重复渲染'],
    breaking: [],
  },
  {
    version: '1.2.1',
    title: '移除内部源',
    date: formatDate('2025-08-28'),
    features: ['移除内部源', '移除演示站迁移提示'],
    fixes: [],
    breaking: [],
  },
  {
    version: '1.2.0',
    title: '新增视频源管理功能',
    date: formatDate('2025-07-14'),
    features: [
      '新增系统视频源管理功能，支持添加、删除视频源',
      '新增添加自定义视频源功能，支持添加自定义视频源',
    ],
    fixes: ['优化了视频源管理功能', '优化视频搜索逻辑，增快搜索速度'],
    breaking: [
      '旧版域名https://tv.new.ouonnki.site即将失效,请尽快使用新版域名访问https://tv.ouonnki.site',
    ],
  },
  {
    version: '1.1.2',
    title: '新增观看记录功能',
    date: formatDate('2025-07-06'),
    features: [
      '新增了观看记录功能，支持查看最近观看的视频',
      '自动记录播放进度，支持继续播放',
      '支持查看观看记录',
    ],
    fixes: ['优化搜索历史移动端显示问题'],
  },
  {
    version: '1.1.1',
    title: '视频播放界面路由优化',
    date: formatDate('2025-07-01'),
    features: ['优化了视频播放界面路由，采用新的路由方式，支持视频播放界面分享'],
    fixes: ['修复更新显示的本地存储问题'],
  },
  {
    version: '1.1.0',
    title: '视频源优化更新',
    date: formatDate('2025-07-01'),
    features: ['优化了视频播放源的选择逻辑', '改进了特殊源的处理逻辑，提高了视频加载成功率'],
    fixes: ['修复了某些视频源无法正常播放的问题', '优化了搜索结果的加载速度'],
    breaking: ['移除了部分不稳定的视频源（华为吧资源、豆瓣资源）'],
  },
  {
    version: '1.0.0',
    title: '初始版本',
    date: formatDate('2025-06-30'),
    features: ['初始版本'],
  },
]

// 获取最新版本号
const LATEST_VERSION = VERSION_UPDATES[0]?.version || '1.0.0'

export const useVersionStore = create<VersionStore>()(
  devtools(
    persist(
      immer<VersionStore>((set, get) => ({
        // 初始状态
        currentVersion: LATEST_VERSION,
        lastViewedVersion: '1.0.0',
        showUpdateModal: false,
        updateHistory: VERSION_UPDATES,

        // Actions
        setCurrentVersion: (version: string) => {
          set(state => {
            state.currentVersion = version
          })
        },

        markVersionAsViewed: (version: string) => {
          set(state => {
            state.lastViewedVersion = version
            state.showUpdateModal = false
          })
        },

        setShowUpdateModal: (show: boolean) => {
          set(state => {
            state.showUpdateModal = show
          })
        },

        hasNewVersion: () => {
          const state = get()
          return state.currentVersion !== state.lastViewedVersion
        },

        getLatestUpdate: () => {
          const state = get()
          // 找到当前版本对应的更新信息
          return state.updateHistory.find(update => update.version === state.currentVersion) || null
        },
      })),
      {
        name: 'ouonnki-tv-version-store',
        version: 1,
        partialize: state => ({
          lastViewedVersion: state.lastViewedVersion,
        }),
      },
    ),
    {
      name: 'VersionStore',
    },
  ),
)
