# TMDB API Key 申请指南

OuonnkiTV 的 TMDB 智能模式需要一个 TMDB API Token 来获取影片元数据、海报和推荐内容。本文档介绍如何申请。

---

## 申请步骤

### 1. 注册 TMDB 账户

访问 [themoviedb.org](https://www.themoviedb.org/) 并注册账户。

### 2. 进入 API 设置页

登录后访问 [API 设置页面](https://www.themoviedb.org/settings/api)。

如果是首次申请，需要先同意使用条款并填写基本信息：
- **应用类型**：选择 Personal
- **应用名称**：填写任意名称（如 OuonnkiTV）
- **应用网址**：填写你的部署地址或 `https://localhost`
- **应用简介**：简要描述用途即可

### 3. 获取 API Read Access Token

申请通过后，在 API 设置页面可以看到两个值：

| 类型 | 说明 |
| ---- | ---- |
| API Key (v3 auth) | 32 位字符串，**不是我们需要的** |
| API Read Access Token (v4 auth) | 以 `eyJ` 开头的长字符串，**使用这个** |

复制 **API Read Access Token**（v4 auth），这就是 OuonnkiTV 需要的 Token。

---

## 配置方式

获取 Token 后，有两种方式启用 TMDB 智能模式：

### 方式一：环境变量（部署时配置）

将 Token 设置为构建时环境变量：

```env
OKI_TMDB_API_TOKEN=eyJhbGciOi...（你的 Token）
```

配置后应用默认启用 TMDB 智能模式。

> 详细的环境变量配置方法请参考 [配置管理](./configuration.md)。

### 方式二：应用内手动输入

如果部署时未配置环境变量，可以在运行时手动配置：

1. 进入 **设置** → **系统设置** → **系统行为**
2. 在「TMDB API Token」输入框中粘贴 Token
3. 开启「TMDB 智能模式」开关

此方式无需重新构建，Token 保存在浏览器本地存储中。

---

## 常见问题

**Q: API Key 和 API Read Access Token 有什么区别？**

API Key 是 v3 版本的认证方式（32 位短字符串），API Read Access Token 是 v4 版本的 Bearer Token（以 `eyJ` 开头的长字符串）。OuonnkiTV 使用的 `tmdb-ts` SDK 需要 v4 的 Read Access Token。

**Q: 申请是否收费？**

TMDB API 对个人和非商业用途免费，有每秒请求频率限制但日常使用完全够用。

**Q: Token 泄露了怎么办？**

在 [API 设置页面](https://www.themoviedb.org/settings/api) 可以重新生成 Token，旧 Token 会立即失效。
