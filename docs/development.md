# 开发者指南

本文档面向希望参与开发或了解项目架构的开发者。

---

## 技术栈

| 技术 | 版本 | 用途 |
| ---- | ---- | ---- |
| React | 19 | 前端框架 |
| TypeScript | 5.8 | 类型系统 |
| Vite | 6 | 构建工具 |
| TailwindCSS | 4 | 样式框架 |
| Radix UI + shadcn/ui | - | UI 组件库 |
| Framer Motion | 12 | 动画库 |
| Artplayer | 5 | 视频播放器 |
| Zustand | 5 | 状态管理（immer + persist） |
| React Router | 7 | 路由管理 |
| React Hook Form + Zod | 7 / 4 | 表单验证 |
| tmdb-ts | 2 | TMDB API 客户端 |
| hls.js | 1 | HLS 流媒体支持 |
| Vitest | 2 | 单元测试 |

**代理架构：**

| 环境 | 实现方式 |
| ---- | ---- |
| 本地开发 | Vite 中间件代理 |
| Vercel | Serverless Function (`api/proxy.ts`) |
| Cloudflare | Workers Function (`functions/proxy.ts`) |
| Netlify | Serverless Function (`netlify/functions/proxy.ts`) |
| Docker | Nginx + Node.js Express (`proxy-server.js`) |

所有代理共享核心逻辑 `shared/proxy-core.js`。

---

## 项目结构

项目采用 **Feature-Sliced Design** 架构，功能按领域模块组织。

```text
OuonnkiTV/
├─ api/                        # Vercel Serverless Functions
│  └─ proxy.ts
├─ functions/                  # Cloudflare Workers Functions
│  └─ proxy.ts
├─ netlify/functions/          # Netlify Serverless Functions
│  └─ proxy.ts
├─ shared/                     # 跨平台代理核心逻辑
│  └─ proxy-core.js
├─ packages/
│  └─ cms-core/                # @ouonnki/cms-core 内容管理核心包
│     ├─ src/
│     │  ├─ core/              # 搜索、聚合、解析、并发控制
│     │  ├─ adapters/          # 网络适配器（fetch、proxy）
│     │  ├─ m3u8/              # M3U8 流处理
│     │  ├─ source/            # 视频源管理（导入、验证、存储）
│     │  ├─ events/            # 事件系统
│     │  ├─ types/             # 类型定义
│     │  └─ utils/             # 工具函数
│     └─ tsup.config.ts
├─ src/
│  ├─ app/                     # 应用入口
│  │  ├─ main.tsx              # 入口文件
│  │  ├─ layouts/              # 布局组件
│  │  ├─ router/               # 路由定义
│  │  └─ styles/               # 全局样式
│  ├─ features/                # 功能模块（Feature-Sliced Design）
│  │  ├─ auth/                 # 认证守卫
│  │  ├─ favorites/            # 收藏管理
│  │  ├─ history/              # 观看历史
│  │  ├─ home/                 # 首页
│  │  ├─ media/                # 媒体详情
│  │  ├─ player/               # 视频播放
│  │  ├─ search/               # 搜索功能
│  │  └─ settings/             # 设置管理
│  ├─ shared/                  # 共享资源
│  │  ├─ components/           # 通用组件
│  │  │  ├─ ui/                # shadcn/ui 基础组件
│  │  │  ├─ icons/             # 图标组件
│  │  │  ├─ theme/             # 主题组件
│  │  │  └─ common/            # 业务通用组件
│  │  ├─ config/               # 应用配置
│  │  ├─ hooks/                # 通用 Hooks
│  │  ├─ lib/                  # 工具库（缓存、代理、路由等）
│  │  ├─ store/                # Zustand Store
│  │  └─ types/                # 全局类型定义
│  └─ middleware/               # Vite 开发代理
│     └─ proxy.dev.ts
├─ public/                     # 静态资源
├─ Dockerfile                  # Docker 多阶段构建
├─ docker-compose.yml          # Docker Compose 编排
├─ nginx.conf                  # Nginx 配置
├─ supervisord.conf            # Supervisord 进程管理
├─ proxy-server.js             # Docker 代理服务器
├─ vite.config.ts              # Vite 构建配置
├─ vitest.config.ts            # Vitest 测试配置
├─ tsconfig.json               # TypeScript 配置
├─ eslint.config.js            # ESLint 配置
├─ components.json             # shadcn/ui 组件配置
└─ pnpm-workspace.yaml         # pnpm Monorepo 工作区
```

每个 feature 模块通常包含以下子目录：

| 子目录 | 说明 |
| ------ | ---- |
| `components/` | 模块专属 UI 组件 |
| `views/` | 页面级视图组件 |
| `hooks/` | 模块专属 Hooks |
| `lib/` | 模块工具函数 |
| `store/` | 模块状态管理 |
| `types/` | 模块类型定义 |
| `constants/` | 模块常量 |
| `index.ts` | 模块公共导出 |

---

## @ouonnki/cms-core

`@ouonnki/cms-core` 是一个无头（headless）、纯函数、事件驱动的 CMS 视频源聚合搜索引擎。它与框架无关，可以在任何 JavaScript/TypeScript 项目中使用，适合构建自己的视频搜索应用、机器人、CLI 工具等。

### 安装

```bash
npm install @ouonnki/cms-core
# 或
pnpm add @ouonnki/cms-core
```

如需 M3U8 流处理功能，还需安装可选依赖：

```bash
pnpm add hls.js
```

### 快速上手

```typescript
import { createCmsClient, createFetchAdapter, createUrlPrefixProxyStrategy } from '@ouonnki/cms-core'

// 1. 创建客户端
const client = createCmsClient({
  requestAdapter: createFetchAdapter(),
  proxyStrategy: createUrlPrefixProxyStrategy('/proxy?url='),
  concurrencyLimit: 3,
})

// 2. 定义视频源
const sources = [
  { id: 'source1', name: '示例源', url: 'https://api.example.com', isEnabled: true },
  { id: 'source2', name: '另一个源', url: 'https://api2.example.com', isEnabled: true },
]

// 3. 监听搜索事件（可选）
client.on('search:progress', event => {
  console.log(`搜索进度: ${event.completed}/${event.total}`)
})

client.on('search:result', event => {
  console.log(`${event.source.name} 返回 ${event.items.length} 条结果`)
})

// 4. 聚合搜索（多源并发，自动去重）
const results = await client.aggregatedSearch('关键词', sources, 1)
console.log(`共找到 ${results.length} 条结果`)

// 5. 获取视频详情和播放地址
const detail = await client.getDetail('video_id', sources[0])
if (detail.success) {
  console.log(detail.videoInfo)    // 视频信息
  console.log(detail.episodes)     // 剧集列表和播放地址
}

// 6. 用完销毁
client.destroy()
```

### 导出入口

| 入口 | 说明 |
| ---- | ---- |
| `@ouonnki/cms-core` | 核心模块（客户端、搜索、聚合、解析、事件、适配器） |
| `@ouonnki/cms-core/m3u8` | M3U8 流处理（过滤、HLS 加载、处理器） |
| `@ouonnki/cms-core/source` | 视频源管理（导入、验证、存储） |

### 核心 API

| API | 说明 |
| --- | ---- |
| `createCmsClient(config?)` | 创建客户端实例，集成搜索、详情、事件等全部功能 |
| `client.search(query, source)` | 单源搜索 |
| `client.aggregatedSearch(query, sources, page, signal?)` | 多源聚合搜索，支持并发控制和 AbortSignal 取消 |
| `client.listVideos(source, page?)` | 获取视频列表（推荐/最新内容） |
| `client.getDetail(id, source)` | 获取视频详情和播放地址 |
| `client.parsePlayUrl(playUrl, playFrom?)` | 解析播放地址，提取剧集列表 |
| `client.on(event, handler)` | 监听事件（search:start/progress/result/complete/error/abort, detail:*） |

### 代理策略

包内置了多种代理策略，用于处理跨域请求：

```typescript
import {
  createUrlPrefixProxyStrategy,  // URL 前缀代理（如 /proxy?url=xxx）
  createWhitelistProxyStrategy,  // 白名单代理（仅代理指定域名）
  createDirectStrategy,          // 直连（不使用代理）
} from '@ouonnki/cms-core'
```

### 适用场景

- 构建自定义视频搜索前端（React、Vue、Svelte 等任意框架）
- 开发视频搜索 Telegram/Discord 机器人
- 编写 CLI 视频搜索工具
- 搭建视频源管理和测试平台
- 任何需要聚合 CMS 视频 API 的场景

### 构建与发布

```bash
# 本地构建
pnpm --filter @ouonnki/cms-core build

# npm 发布（通过 GitHub Actions 手动触发）
# 进入 Actions → Publish @ouonnki/cms-core → Run workflow
```

---

## 开发指南

### 环境准备

```bash
# 环境要求
# Node.js >= 20.0.0
# pnpm >= 9.15.4

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 代码规范

```bash
# ESLint 检查
pnpm lint

# TypeScript 类型检查
pnpm build  # tsc -b && vite build

# 运行测试
pnpm test
```

### 提交规范

| 前缀 | 说明 |
| ---- | ---- |
| `feat:` | 新功能 |
| `fix:` | 修复 Bug |
| `docs:` | 文档更新 |
| `style:` | 代码格式调整 |
| `refactor:` | 重构代码 |
| `perf:` | 性能优化 |
| `test:` | 测试相关 |
| `chore:` | 构建/工具链更新 |

---

## 常用命令

| 命令 | 说明 |
| ---- | ---- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生产环境构建 |
| `pnpm preview` | 预览构建结果 |
| `pnpm test` | 运行测试 |
| `pnpm lint` | ESLint 代码检查 |
| `pnpm docker:build` | 构建 Docker 镜像 |
| `pnpm docker:up` | 启动 Docker 容器 |
| `pnpm docker:down` | 停止 Docker 容器 |
| `pnpm docker:logs` | 查看 Docker 日志 |
