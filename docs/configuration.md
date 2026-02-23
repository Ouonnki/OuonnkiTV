# 配置管理

OuonnkiTV 支持通过环境变量预定义应用的默认配置。当用户点击 **设置** → **关于项目** → **配置操作** → **恢复默认配置** 时，应用将重置为这些预定义的默认值。

---

## 环境变量参考

以下环境变量仅在**构建时**生效，均以 `OKI_` 为前缀。

| 变量名 | 必需 | 说明 |
| ------ | ---- | ---- |
| `OKI_INITIAL_VIDEO_SOURCES` | 否 | 初始视频源（JSON 字符串或远程 URL） |
| `OKI_TMDB_API_TOKEN` | 否 | TMDB API Token，启用 [TMDB 智能模式](#-tmdb-配置建议启用)获取影片元数据 |
| `OKI_ACCESS_PASSWORD` | 否 | 访问密码（留空则公开访问） |
| `OKI_DISABLE_ANALYTICS` | 否 | 设为 `true` 禁用 Vercel Analytics（Docker 等非 Vercel 部署建议设为 `true`） |
| `OKI_INITIAL_CONFIG` | 否 | 完整 JSON 配置（包含所有设置和视频源） |

### 默认视频源（`OKI_INITIAL_VIDEO_SOURCES`）

支持两种格式：

**JSON 字符串：**
```env
OKI_INITIAL_VIDEO_SOURCES=[{"name":"示例源","url":"https://api.example.com","isEnabled":true}]
```

**远程 URL：**
```env
OKI_INITIAL_VIDEO_SOURCES=https://example.com/sources.json
```

> JSON 字段详细说明和格式要求请参考 [视频源导入](./video-sources.md)

### 完整配置导入（`OKI_INITIAL_CONFIG`）

使用 `OKI_INITIAL_CONFIG` 可一次性导入完整配置（包含所有应用设置和视频源），格式与应用内「导出个人配置」生成的 JSON 一致。

```env
OKI_INITIAL_CONFIG='{"settings":{...},"videoSources":[...],"meta":{...}}'
```

> **优先级说明**：`OKI_INITIAL_CONFIG` 中的视频源和设置优先于 `OKI_INITIAL_VIDEO_SOURCES` 及代码默认值。

### 操作指南

1. **导出模版**：在应用中配置好理想状态，点击 **导出个人配置** → **导出为文本**
2. **设置变量**：将复制的 JSON 内容赋值给 `OKI_INITIAL_CONFIG` 环境变量
3. **构建应用**：根据部署方式重新构建
   - **Docker Compose**：`docker-compose up -d --build`
   - **Vercel**：在项目设置 → Environment Variables 中添加，保存后重新部署
   - **Cloudflare Pages**：在项目设置 → Environment Variables 中添加，触发重新构建
   - **Netlify**：在 Site settings → Environment variables 中添加，触发重新部署
   - **本地开发**：写入 `.env` 文件后重新运行 `pnpm build`
4. **恢复默认**：执行「恢复默认配置」，应用将加载该 JSON 中的状态

---

## TMDB 配置（建议启用）

OuonnkiTV 支持通过 [TMDB](https://www.themoviedb.org/)（The Movie Database）获取影片元数据、海报和推荐内容。启用后可显著提升浏览体验，建议所有用户配置。

> Token 申请方法请参考 [TMDB API Key 申请指南](./tmdb-key.md)

### 两种运行模式

| 模式 | 说明 |
| ---- | ---- |
| **TMDB 智能模式** | 启用 TMDB 集成，搜索结果自动匹配影片元数据、显示海报、评分和推荐 |
| **兼容模式** | 关闭 TMDB，仅使用视频源自身数据，适合无 TMDB Token 的场景 |

### 配置方式

**方式一：环境变量（部署时配置）**

```env
OKI_TMDB_API_TOKEN=your_tmdb_api_token_here
```

配置后应用默认启用 TMDB 智能模式。

**方式二：应用内手动输入**

如果未配置环境变量 Token，可以在运行时手动配置：

1. 进入 **设置** → **系统设置** → **系统行为**
2. 在「TMDB API Token」输入框中输入你的 Token
3. 开启「TMDB 智能模式」开关

> Token 从 [themoviedb.org](https://www.themoviedb.org/settings/api) 获取（需注册账户），详细申请步骤见 [TMDB API Key 申请指南](./tmdb-key.md)。

### TMDB 智能模式设置

启用 TMDB 后可调整以下选项：

| 设置项 | 说明 | 默认值 |
| ------ | ---- | ------ |
| TMDB 内容语言 | 影片标题、简介等数据的显示语言 | 简体中文（zh-CN） |
| TMDB 图片质量 | 海报和背景图的加载质量 | 中（w500/w780） |

可选语言：简体中文、繁體中文、English、日本語

图片质量等级：
- **低**：w342（节省流量）
- **中**：w500/w780（推荐）
- **高**：original（最佳画质，流量消耗大）
