import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://app.advbox.com.br',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
      }
    }
  },
  preview: {
    port: parseInt(process.env.PORT || '3000'),
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'https://app.advbox.com.br',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
      }
    }
  }
})
