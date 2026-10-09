import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env    = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_API_PROXY_TARGET ?? 'https://api.13-49-18-61.sslip.io'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        // Same-origin from the browser → XSRF-TOKEN cookie is readable → CSRF works
        '/api': {
          target,
          changeOrigin: true,
          secure: false,
        },
        '/sanctum': {
          target,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
