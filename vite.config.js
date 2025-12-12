import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // eslint-disable-next-line no-undef
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: false,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'https://api-cards-robotic-club.tech-sauce.com',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
