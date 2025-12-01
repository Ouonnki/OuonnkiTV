<h1 align="center">
  <img src="https://ouonnki.site/upload/logo.svg" alt="OuonnkiTV Logo" width="80"/><br/>
  OuonnkiTV
</h1>

<p align="center">
  现代化、可扩展的视频搜索与播放前端。
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-blue" alt="License"/></a>
  <img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen" alt="Node.js >=20"/>
  <img src="https://img.shields.io/badge/pnpm-%3E%3D9.15.4-blue" alt="pnpm >=9.15.4"/>
  <img src="https://img.shields.io/badge/vite-%5E6.3.5-yellowgreen" alt="Vite"/>
  <a href="https://github.com/Ouonnki/OuonnkiTV/stargazers"><img src="https://img.shields.io/github/stars/Ouonnki/OuonnkiTV?style=social" alt="GitHub stars"/></a>
</p>

<p align="center">
  <a href="#-简介">简介</a> ·
  <a href="#-特性">特性</a> ·
  <a href="#-部署">部署</a> ·
  <a href="#-更新同步">更新</a> ·
  <a href="#-视频源导入">导入</a> ·
  <a href="#-给开发者">开发</a>
</p>

---

<details>
<summary><strong>📑 目录</strong></summary>

- [📖 简介](#-简介)
- [✨ 特性](#-特性)
- [🚀 部署](#-部署)
  - [Vercel 部署](#vercel-部署)
  - [Cloudflare Pages 部署](#cloudflare-pages-部署)
  - [Netlify 部署](#netlify-部署)
  - [Docker 部署](#docker-部署)
    - [方式一：Docker Compose（推荐）](#方式一docker-compose推荐)
    - [方式二：预构建镜像（快速启动）](#方式二预构建镜像快速启动)
  - [本地运行](#本地运行)
- [🔄 更新同步](#-更新同步)
  - [Vercel 更新](#vercel-更新)
  - [Docker 更新](#docker-更新)
  - [本地更新](#本地更新)
  - [Fork 同步](#fork-同步)
    - [方式一：GitHub Action 自动同步（已内置）](#方式一github-action-自动同步已内置)
    - [方式二：GitHub 原生同步](#方式二github-原生同步)
- [📥 视频源导入](#-视频源导入)
  - [应用内导入](#应用内导入)
    - [📁 本地文件导入](#-本地文件导入)
    - [📝 JSON 文本导入](#-json-文本导入)
    - [🌐 URL 导入](#-url-导入)
  - [JSON 格式说明](#json-格式说明)
  - [环境变量预配置](#环境变量预配置)
    - [本地开发或 Docker 部署](#本地开发或-docker-部署)
    - [在 Vercel 中配置](#在-vercel-中配置)
    - [在 Cloudflare Pages 中配置](#在-cloudflare-pages-中配置)
    - [在 Netlify 中配置](#在-netlify-中配置)
    - [其他配置项](#其他配置项)
- [👨‍💻 给开发者](#-给开发者)
  - [技术栈](#技术栈)
  - [项目结构](#项目结构)
  - [开发指南](#开发指南)
  - [常用命令](#常用命令)
- [📜 其他](#-其他)
  - [贡献指南](#贡献指南)
  - [许可证](#许可证)
  - [免责声明](#免责声明)

</details>

## 📖 简介

**OuonnkiTV** 是一个现代化的视频聚合搜索与播放前端应用，基于 **React 19 + Vite 6 + TypeScript** 构建。

本项目在 LibreSpark/LibreTV 的基础上进行了全面重构，采用现代化的技术栈和架构设计，提升了代码质量、性能表现和用户体验。

## ✨ 特性

- **🔍 聚合搜索** - 多源并发搜索，自动去重，快速定位内容
- **▶️ 流畅播放** - 基于 xgplayer，支持 HLS/MP4，自适应码率
- **📥 批量导入** - 支持文件/文本/URL 多种方式导入视频源
- **🕒 智能记录** - 自动保存观看历史与搜索记录，便于追溯
- **📱 响应式设计** - 移动端/桌面端自适应布局
- **🚀 高性能优化** - 代码分割、懒加载、并发控制
- **💾 状态持久化** - 基于 Zustand 的状态管理，数据本地存储

## 🚀 部署

### Vercel 部署

点击下方按钮，一键部署到 Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Ouonnki/OuonnkiTV&build-command=pnpm%20build&install-command=pnpm%20install&output-directory=dist)

**部署步骤：**
1. Fork 本仓库到您的 GitHub 账户
2. 登录 Vercel，点击 "New Project"
3. 导入您的 GitHub 仓库
4. 配置构建选项（通常自动识别）：
   - Install Command: `pnpm install`
   - Build Command: `pnpm build`
   - Output Directory: `dist`
5. （可选）添加环境变量配置初始视频源
6. 点击 "Deploy" 开始部署

---

### Cloudflare Pages 部署

**部署步骤：**
1. Fork 本仓库到您的 GitHub 账户
2. 登录 Cloudflare Dashboard，进入 **Workers & Pages**
3. 点击 **Create application** -> **Pages** -> **Connect to Git**
4. 选择您的仓库
5. 配置构建选项：
   - **Framework preset**: 选择 `Vite`
   - **Build command**: `pnpm run build`
   - **Build output directory**: `dist`
6. 点击 **Save and Deploy**

---

### Netlify 部署

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Ouonnki/OuonnkiTV)

**部署步骤：**
1. 点击上方按钮，或登录 Netlify 点击 "Add new site" -> "Import an existing project"
2. 连接 GitHub 并选择您的仓库
3. Netlify 会自动识别配置文件 (`netlify.toml`)，无需手动配置构建命令
4. 点击 **Deploy site**

---

### Docker 部署

#### 方式一：Docker Compose（推荐）

```bash
# 首次部署或修改配置后启动（重新构建）
docker-compose up -d --build
```

**环境变量配置**（可选）：

1. 复制环境变量示例文件：
   ```bash
   copy .env.example .env
   ```

2. 编辑 `.env` 文件进行自定义配置：
   ```env
   # 初始视频源（单行 JSON 格式）
   VITE_INITIAL_VIDEO_SOURCES=[{"name":"示例源","url":"https://api.example.com","isEnabled":true}]
   
   # 禁用分析（建议开启）
   VITE_DISABLE_ANALYTICS=true
   ```

3. 构建并启动：
   ```bash
   docker-compose up -d --build
   ```

> ⚠️ **重要提示**：
> - 环境变量在**构建时**注入，修改后必须使用 `--build` 参数重新构建
> - 如果只运行 `docker-compose up -d`，环境变量的修改不会生效

#### 方式二：预构建镜像（快速启动）

```bash
# 拉取并运行最新版本
docker pull ghcr.io/ouonnki/ouonnkitv:latest
docker run -d -p 3000:80 ghcr.io/ouonnki/ouonnkitv:latest

# 访问 http://localhost:3000
```

**可用镜像标签：**
- `latest` - 最新稳定版
- `main` - 主分支最新代码
> ⚠️ **限制说明**：预构建镜像**无法通过环境变量修改初始配置**，只能使用镜像构建时的默认值。
> **如需自定义视频源，请在应用内手动导入，或使用 Docker Compose 方式本地构建。**

---

### 本地运行

**环境要求：**
- Node.js >= 20.0.0
- pnpm >= 9.15.4

**启动步骤：**
```bash
# 克隆仓库
git clone https://github.com/Ouonnki/OuonnkiTV.git
cd OuonnkiTV

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 访问 http://localhost:3000
```

**构建生产版本：**
```bash
pnpm build       # 构建
pnpm preview     # 预览，访问 http://localhost:4173
```

---

## 🔄 更新同步

### Vercel 更新

Vercel 部署的项目会自动跟踪 GitHub 仓库变化：

1. **自动更新**：每次推送到主分支时自动重新部署
2. **手动更新**：
   - 进入 Vercel 项目控制台
   - 点击 "Deployments" 标签
   - 点击右上角 "Redeploy" 按钮

### Docker 更新

**Docker Compose 方式：**
```bash
# 拉取最新镜像
docker-compose pull

# 重启服务
docker-compose up -d
```

**预构建镜像方式：**
```bash
# 停止并删除旧容器
docker stop <container_id>
docker rm <container_id>

# 拉取最新镜像
docker pull ghcr.io/ouonnki/ouonnkitv:latest

# 运行新容器
docker run -d -p 3000:80 ghcr.io/ouonnki/ouonnkitv:latest
```

### 本地更新

```bash
# 拉取最新代码
git pull origin main

# 更新依赖
pnpm install

# 重启开发服务器
pnpm dev
```

### Fork 同步

保持 Fork 仓库与上游同步：

#### 方式一：GitHub Action 自动同步（已内置）

项目内置了自动同步工作流（`.github/workflows/sync.yml`）：

- **触发时间**：每日 UTC 02:00 自动运行
- **手动触发**：进入 Fork 仓库的 Actions → 选择 "Sync Upstream" → Run workflow
- **同步策略**：若 `main` 分支无独立提交，则强制同步；否则跳过
- **注意事项**：自定义修改建议放在独立分支，避免在 `main` 分支直接修改

#### 方式二：GitHub 原生同步

1. 进入你的 Fork 仓库主页
2. 点击 "Sync fork" 按钮
3. 选择 "Update branch" 完成同步

**CLI 手动同步：**
```bash
git remote add upstream https://github.com/Ouonnki/OuonnkiTV.git  # 仅首次
git fetch upstream
git checkout main
git merge upstream/main  # 或使用 rebase
git push origin main
```

---

## 📥 视频源导入

OuonnkiTV 支持多种方式批量导入视频源配置，方便快速部署和分享。

### 应用内导入

应用内提供三种导入方式：

#### 📁 本地文件导入
- 支持 `.json` 格式文件
- 拖拽或点击选择文件
- 自动验证格式与字段

#### 📝 JSON 文本导入
- 直接粘贴 JSON 配置
- 实时语法检查
- 支持格式化或压缩的 JSON

#### 🌐 URL 导入
- 从远程 URL 获取配置
- 支持 GitHub Raw、Gitee、个人服务器等
- 自动处理网络请求

**使用方法：**
1. 点击右上角设置图标进入设置页面
2. 点击"导入源"按钮
3. 选择导入方式并提供数据
4. 点击"开始导入"

**导入特性：**
- ✅ 自动去重，避免重复源
- ✅ 格式验证，确保数据正确
- ✅ 批量处理，一次导入多个源
- ✅ 实时反馈，详细的错误提示

---

### JSON 格式说明

**标准格式：**
```json
[
  {
    "id": "source1",
    "name": "示例视频源",
    "url": "https://api.example.com/search",
    "detailUrl": "https://api.example.com/detail",
    "isEnabled": true
  }
]
```

**字段说明：**
| 字段 | 必需 | 说明 |
| ---- | ---- | ---- |
| `id` | 否 | 唯一标识符（自动生成） |
| `name` | 是 | 视频源显示名称 |
| `url` | 是 | 搜索 API 地址 |
| `detailUrl` | 否 | 详情 API 地址（默认使用 url） |
| `isEnabled` | 否 | 是否启用（默认 true） |

**支持格式：**
- 单个对象：`{"name":"源名称","url":"API地址"}`
- 对象数组：`[{...},{...}]`
- 多行格式化或压缩单行均可

---

### 环境变量预配置

除了应用内导入，还可以通过环境变量在构建时预配置初始视频源。

> ⚠️ **重要说明**：环境变量配置仅在**构建时**生效，适用于自行构建部署的场景（本地构建、Docker 构建、Vercel 自动构建）。使用预构建镜像时无法通过环境变量修改配置。

#### 本地开发或 Docker 部署

**步骤 1：创建配置文件**
```bash
# 复制示例文件
copy .env.example .env  # Windows
# cp .env.example .env  # Linux/Mac
```

**步骤 2：编辑 `.env` 文件**

方式一：直接配置 JSON（单行格式）
```env
VITE_INITIAL_VIDEO_SOURCES=[{"name":"源1","url":"https://api1.com","isEnabled":true},{"name":"源2","url":"https://api2.com"}]
```

方式二：远程 JSON URL
```env
VITE_INITIAL_VIDEO_SOURCES=https://raw.githubusercontent.com/yourname/repo/main/sources.json
```

方式三：留空（默认）
```env
VITE_INITIAL_VIDEO_SOURCES=
```

**步骤 3：构建并运行**
```bash
# 本地开发
pnpm dev

# Docker 部署（必须重新构建）
docker-compose up -d --build
```

> 💡 **Docker 注意事项**：修改环境变量后必须使用 `--build` 参数重新构建镜像才能生效。

#### 在 Vercel 中配置

**步骤 1：配置环境变量**
1. 进入 Vercel 项目设置 → Environment Variables
2. 添加变量 `VITE_INITIAL_VIDEO_SOURCES`
3. 填入 JSON 配置或远程 URL：
   ```
   [{"name":"源1","url":"https://api.example.com"}]
   ```
4. 选择应用环境（Production / Preview / Development）

**步骤 2：重新部署**
- 点击 "Redeploy" 按钮，或
- 推送新提交触发自动部署

#### 在 Cloudflare Pages 中配置

**步骤 1：配置环境变量**
1. 进入 Cloudflare Pages 项目设置 → **Settings** → **Environment variables**
2. 点击 **Add variable**
3. 变量名：`VITE_INITIAL_VIDEO_SOURCES`
4. 变量值：填入 JSON 配置或远程 URL
   ```json
   [{"name":"源1","url":"https://api.example.com"}]
   ```
5. 点击 **Save**

**步骤 2：重新部署**
- 进入 **Deployments** 标签页
- 点击最新部署右侧的三个点 → **Retry deployment**

#### 在 Netlify 中配置

**步骤 1：配置环境变量**
1. 进入 Netlify 站点设置 → **Site configuration** → **Environment variables**
2. 点击 **Add a variable**
3. Key: `VITE_INITIAL_VIDEO_SOURCES`
4. Value: 填入 JSON 配置或远程 URL
5. 点击 **Create variable**

**步骤 2：重新部署**
- 进入 **Deploys** 标签页
- 点击 **Trigger deploy** → **Deploy site**

#### 其他配置项

**禁用分析跟踪：**
```env
VITE_DISABLE_ANALYTICS=true
```

**Docker 构建元数据（可选）：**
```env
BUILD_DATE=2025-01-01
VCS_REF=abc1234
VERSION=1.0.0
```

---

## 👨‍💻 给开发者

<details>
<summary><strong>点击展开开发者文档</strong></summary>

### 技术栈

| 技术 | 版本 | 用途 |
| ---- | ---- | ---- |
| React | 19 | 前端框架 |
| TypeScript | 5.x | 类型系统 |
| Vite | 6 | 构建工具 |
| TailwindCSS | 4 | 样式框架 |
| HeroUI | - | UI 组件库 |
| Framer Motion | - | 动画库 |
| xgplayer | - | 视频播放器 |
| Zustand | - | 状态管理 |
| React Router | 7 | 路由管理 |

**代理架构：**
- **本地开发**：Vite 中间件代理
- **Vercel**：Serverless Function
- **Docker**：Nginx + Node.js Express

---

### 项目结构

```text
OuonnkiTV/
├─ api/                      # Vercel Serverless Functions
│  └─ proxy.ts              # Vercel 代理接口
├─ src/
│  ├─ middleware/           # 中间件
│  │  └─ proxy.dev.ts      # Vite 开发代理
│  ├─ utils/               # 工具函数
│  │  └─ proxy.ts          # 统一代理逻辑
│  ├─ components/          # React 组件
│  ├─ config/              # 配置文件
│  │  ├─ api.config.ts     # API 配置
│  │  └─ analytics.config.ts
│  ├─ hooks/               # 自定义 Hooks
│  ├─ pages/               # 页面组件
│  ├─ services/            # API 服务层
│  ├─ store/               # Zustand 状态管理
│  └─ types/               # TypeScript 类型定义
├─ proxy-server.js          # Docker 代理服务器
├─ nginx.conf               # Nginx 配置
├─ Dockerfile               # Docker 镜像
└─ docker-compose.yml       # Docker Compose 配置
```

**核心文件说明：**
- `src/utils/proxy.ts` - 统一代理逻辑，供所有环境复用
- `src/config/api.config.ts` - API 配置与代理 URL
- `src/services/api.service.ts` - API 请求封装与 URL 构建

---

### 开发指南

**环境准备：**
```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

**代码规范：**
```bash
# ESLint 检查
pnpm lint

# 类型检查
pnpm type-check
```

**构建部署：**
```bash
# 生产构建
pnpm build

# 本地预览
pnpm preview

# Docker 构建
pnpm docker:build

# Docker 运行
pnpm docker:up
```

**提交规范：**
- `feat:` 新功能
- `fix:` 修复 Bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 重构代码
- `perf:` 性能优化
- `test:` 测试相关
- `chore:` 构建/工具链更新

---

### 常用命令

| 命令 | 说明 |
| ---- | ---- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生产环境构建 |
| `pnpm preview` | 预览构建结果 |
| `pnpm lint` | ESLint 代码检查 |
| `pnpm docker:build` | 构建 Docker 镜像 |
| `pnpm docker:up` | 启动 Docker 容器 |
| `pnpm docker:down` | 停止 Docker 容器 |
| `pnpm docker:logs` | 查看 Docker 日志 |

</details>

---

## 📜 其他

### 贡献指南

欢迎贡献代码、文档或提出建议！

**参与方式：**
1. 提交 [Issue](https://github.com/Ouonnki/OuonnkiTV/issues) 报告问题或建议功能
2. 提交 [Pull Request](https://github.com/Ouonnki/OuonnkiTV/pulls) 贡献代码

**贡献流程：**
1. Fork 本仓库
2. 创建特性分支：`git checkout -b feat/your-feature`
3. 提交更改：`git commit -m "feat: add xxx"`
4. 推送分支：`git push origin feat/your-feature`
5. 提交 Pull Request

**注意事项：**
- 遵循现有代码风格
- 保持提交信息清晰简洁
- 更新相关文档
- 关联相关 Issue

---

### 许可证

本项目采用 [Apache License 2.0](LICENSE) 开源协议。

---

### 免责声明

**重要提示：**

本项目仅作为视频搜索与聚合工具，不存储、上传或分发任何视频内容。所有视频内容均来自第三方 API 的搜索结果。

- ❌ 本项目不提供任何视频源
- ❌ 本项目不托管任何视频内容
- ❌ 本项目不对视频内容负责

如发现侵权内容，请联系原始内容提供方处理。

开发者不对使用本项目造成的任何直接或间接后果负责。使用前请确保遵守当地法律法规。

---

<p align="center">
  <strong>⭐ Star 趋势</strong>
</p>

<p align="center">
  <a href="https://star-history.com/#Ouonnki/OuonnkiTV&Date">
    <img src="https://api.star-history.com/svg?repos=Ouonnki/OuonnkiTV&type=Date" alt="Star History Chart" />
  </a>
</p>

<p align="center">
  如果本项目对你有帮助，欢迎 ⭐ Star 支持！
</p>
