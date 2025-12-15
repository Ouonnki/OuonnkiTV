import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { proxyMiddleware } from './src/middleware/proxy.dev'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [react(), tailwindcss(), proxyMiddleware()],
  build: {
    // 优化构建性能
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'ui-vendor': ['@heroui/react', 'framer-motion'],
          'player-vendor': ['artplayer', 'hls.js'],
        },
      },
    },
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 构建目标
    target: 'es2020',
    // 启用源码映射（用于调试）
    sourcemap: false,
  },
  // 服务器配置
  server: {
    port: 3000,
    strictPort: false,
  },
})
