# 部署指南

本文档详细介绍 OuonnkiTV 的各种部署方式和更新同步方法。

---

## Docker 部署

### 方式一：Docker Compose（推荐）

```bash
# 首次部署或修改配置后启动（重新构建）
docker-compose up -d --build
```

**环境变量配置**（可选）：

1. 复制环境变量示例文件：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件进行自定义配置：
   ```env
   # 初始视频源（单行 JSON 格式）
   OKI_INITIAL_VIDEO_SOURCES=[{"name":"示例源","url":"https://api.example.com","isEnabled":true}]

   # TMDB API Token（可选，启用 TMDB 智能模式，申请方式见下方链接）
   OKI_TMDB_API_TOKEN=your_tmdb_token

   # 禁用分析（建议开启）
   OKI_DISABLE_ANALYTICS=true

   # 访问密码（可选）
   OKI_ACCESS_PASSWORD=your_secure_password
   ```

   > 📘 完整环境变量说明 → [配置管理](./configuration.md)
   > 📘 TMDB Token 申请方法 → [TMDB API Key 申请指南](./tmdb-key.md)

3. 构建并启动：
   ```bash
   docker-compose up -d --build
   ```

> **重要提示**：环境变量在**构建时**注入，修改后必须使用 `--build` 参数重新构建。如果只运行 `docker-compose up -d`，环境变量的修改不会生效。

### 方式二：预构建镜像（快速启动）

提供 Docker Hub 和 GitHub Container Registry 两个镜像源：

```bash
# Docker Hub（推荐国内用户）
docker pull ouonnki/ouonnkitv:latest
docker run -d -p 3000:80 ouonnki/ouonnkitv:latest

# GitHub Container Registry
docker pull ghcr.io/ouonnki/ouonnkitv:latest
docker run -d -p 3000:80 ghcr.io/ouonnki/ouonnkitv:latest

# 访问 http://localhost:3000
```

**可用镜像标签：**

| 标签 | 说明 |
| ---- | ---- |
| `latest` | main 分支最新构建 |
| `main` | main 分支每次推送自动生成 |
| `main-abc1234` | 带 7 位提交哈希的精确标签 |

> **限制说明**：预构建镜像**无法通过环境变量修改初始配置**，只能使用镜像构建时的默认值。如需自定义视频源，请在应用内手动导入，或使用 Docker Compose 方式本地构建。

---

## Vercel 部署

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
5. （可选）配置环境变量（参考 [配置管理](./configuration.md)，TMDB Token 申请参考 [TMDB API Key 申请指南](./tmdb-key.md)）
6. 点击 "Deploy" 开始部署

---

## Cloudflare Pages 部署

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

> 📘 环境变量配置参考 [配置管理](./configuration.md)

---

## Netlify 部署

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Ouonnki/OuonnkiTV)

**部署步骤：**
1. 点击上方按钮，或登录 Netlify 点击 "Add new site" -> "Import an existing project"
2. 连接 GitHub 并选择您的仓库
3. Netlify 会自动识别配置文件 (`netlify.toml`)，无需手动配置构建命令
4. 点击 **Deploy site**

> 📘 环境变量配置参考 [配置管理](./configuration.md)

---

## 本地运行

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

## 更新同步

### Vercel 更新

Vercel 部署的项目会自动跟踪 GitHub 仓库变化：

1. **自动更新**：每次推送到主分支时自动重新部署
2. **手动更新**：进入 Vercel 项目控制台 → Deployments → 点击 "Redeploy"

### Docker 更新

**Docker Compose 方式：**
```bash
docker-compose pull
docker-compose up -d
```

**预构建镜像方式：**
```bash
# 停止并删除旧容器
docker stop <container_id>
docker rm <container_id>

# 拉取最新镜像（选择其一）
docker pull ouonnki/ouonnkitv:latest
docker pull ghcr.io/ouonnki/ouonnkitv:latest

# 运行新容器
docker run -d -p 3000:80 ouonnki/ouonnkitv:latest
```

### 本地更新

```bash
git pull origin main
pnpm install
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
