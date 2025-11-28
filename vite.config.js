import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: false,
    proxy: {
      '/api': {
        target: 'https://api-cards-robotic-club.tech-sauce.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
