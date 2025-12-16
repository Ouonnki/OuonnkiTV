# 多阶段构建
# 第一阶段：构建应用
FROM node:20-alpine AS builder

# 构建参数
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION
ARG VITE_INITIAL_VIDEO_SOURCES
ARG VITE_DISABLE_ANALYTICS

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@10.15.1 --registry=https://registry.npmmirror.com

# 复制依赖声明及 .npmrc（确保私有源/registry 配置在安装时生效）
COPY package.json pnpm-lock.yaml .npmrc ./

# 安装依赖（使用 frozen-lockfile 保证与锁文件一致，不生成新锁）
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 设置构建时环境变量
ENV VITE_INITIAL_VIDEO_SOURCES=${VITE_INITIAL_VIDEO_SOURCES}
ENV VITE_DISABLE_ANALYTICS=${VITE_DISABLE_ANALYTICS:-true}

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

# 安装 nginx 和 supervisor
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && \
    apk add --no-cache nginx supervisor

# 安装 pnpm
RUN npm install -g pnpm@10.15.1 --registry=https://registry.npmmirror.com

# 创建必要的目录
RUN mkdir -p /run/nginx /var/log/supervisor /app

# 设置工作目录
WORKDIR /app

# 复制代理服务器文件
COPY proxy-server.js ./

# 只安装代理所需的依赖
RUN pnpm add express cors

# 复制构建产物到 nginx 静态文件目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 创建 supervisor 配置
RUN echo "[supervisord]" > /etc/supervisord.conf && \
  echo "nodaemon=true" >> /etc/supervisord.conf && \
  echo "logfile=/var/log/supervisor/supervisord.log" >> /etc/supervisord.conf && \
  echo "pidfile=/var/run/supervisord.pid" >> /etc/supervisord.conf && \
  echo "" >> /etc/supervisord.conf && \
  echo "[program:nginx]" >> /etc/supervisord.conf && \
  echo "command=nginx -g 'daemon off;'" >> /etc/supervisord.conf && \
  echo "autostart=true" >> /etc/supervisord.conf && \
  echo "autorestart=true" >> /etc/supervisord.conf && \
  echo "stdout_logfile=/dev/stdout" >> /etc/supervisord.conf && \
  echo "stdout_logfile_maxbytes=0" >> /etc/supervisord.conf && \
  echo "stderr_logfile=/dev/stderr" >> /etc/supervisord.conf && \
  echo "stderr_logfile_maxbytes=0" >> /etc/supervisord.conf && \
  echo "" >> /etc/supervisord.conf && \
  echo "[program:proxy]" >> /etc/supervisord.conf && \
  echo "command=node /app/proxy-server.js" >> /etc/supervisord.conf && \
  echo "directory=/app" >> /etc/supervisord.conf && \
  echo "autostart=true" >> /etc/supervisord.conf && \
  echo "autorestart=true" >> /etc/supervisord.conf && \
  echo "stdout_logfile=/dev/stdout" >> /etc/supervisord.conf && \
  echo "stdout_logfile_maxbytes=0" >> /etc/supervisord.conf && \
  echo "stderr_logfile=/dev/stderr" >> /etc/supervisord.conf && \
  echo "stderr_logfile_maxbytes=0" >> /etc/supervisord.conf

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# 使用 supervisor 启动 nginx 和代理服务器
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
