import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// The SPA is served under a base path (default /quiver/) so it can be mounted
// alongside a host app's own routes. It must match the backend mount path
// (QUIVER_FRONTEND_PATH) and the API prefix lives under it at /quiver/v1.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE_PATH || '/quiver/'
  const apiPrefix = env.VITE_API_BASE_URL || '/quiver/v1'

  return {
    base,
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        // Proxy only the API to the backend; the SPA assets are served by Vite.
        [apiPrefix]: {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: '../backend/quiver/static',
      emptyOutDir: true,
    },
  }
})
