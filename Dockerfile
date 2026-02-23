# 多阶段构建
# 第一阶段：构建应用
FROM node:20-alpine AS builder

# 构建参数
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION
ARG OKI_INITIAL_VIDEO_SOURCES
ARG OKI_TMDB_API_TOKEN
ARG OKI_ACCESS_PASSWORD
ARG OKI_DISABLE_ANALYTICS
ARG OKI_INITIAL_CONFIG

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@10.15.1

# 复制依赖声明及 .npmrc（确保私有源/registry 配置在安装时生效）
# 对于 pnpm workspace，必须在安装前复制 workspace 清单和子包 package.json，
# 否则 workspace 子包的依赖（例如 packages/cms-core 的 tsup）不会被安装。
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/cms-core/package.json packages/cms-core/package.json

# 安装依赖（使用 frozen-lockfile 保证与锁文件一致，不生成新锁）
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 设置构建时环境变量（Vite 在构建时将这些值内联到前端代码）
ENV OKI_INITIAL_VIDEO_SOURCES=${OKI_INITIAL_VIDEO_SOURCES}
ENV OKI_TMDB_API_TOKEN=${OKI_TMDB_API_TOKEN}
ENV OKI_ACCESS_PASSWORD=${OKI_ACCESS_PASSWORD}
ENV OKI_DISABLE_ANALYTICS=${OKI_DISABLE_ANALYTICS:-true}
ENV OKI_INITIAL_CONFIG=${OKI_INITIAL_CONFIG}

# 构建应用
RUN pnpm build

# 第二阶段：运行时环境
FROM node:20-alpine AS production

# Re-declare ARGs for use in labels
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION

# 添加标签
LABEL org.opencontainers.image.title="OuonnkiTV"
LABEL org.opencontainers.image.description="OuonnkiTV Web Application"
LABEL org.opencontainers.image.version=${VERSION}
LABEL org.opencontainers.image.created=${BUILD_DATE}
LABEL org.opencontainers.image.revision=${VCS_REF}
LABEL org.opencontainers.image.source="https://github.com/Ouonnki/OuonnkiTV"

# 安装 nginx 和 supervisor，并清理缓存
RUN apk add --no-cache nginx supervisor && \
    rm -rf /var/cache/apk/*

# 创建必要的目录
RUN mkdir -p /run/nginx /var/log/supervisor /app

# 设置工作目录
WORKDIR /app

# 复制代理服务器文件和共享模块
COPY proxy-server.js ./
COPY shared/ ./shared/

# 创建最小 package.json 确保 Node.js 以 ESM 模式解析 .js 文件
RUN echo '{"type":"module"}' > package.json

# 只安装代理所需的依赖（使用 npm 而非 pnpm，避免额外安装 pnpm）
RUN npm install --no-audit --no-fund express@4.21.2 cors@2.8.5 && \
    npm cache clean --force

# 复制构建产物到 nginx 静态文件目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制配置文件
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisord.conf

# 暴露端口
EXPOSE 80

# 使用 supervisor 启动 nginx 和代理服务器
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
