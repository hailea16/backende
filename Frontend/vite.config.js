import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
    proxy: {
      '/api': {
        // target: 'http://:5000',
        target: 'https://backende-su97.onrender.com',
        changeOrigin: true,
      },
      '/uploads': {
        // target: 'http://localhost:5000',
        target: 'https://backende-su97.onrender.com',
        changeOrigin: true,
      }
    }
  }
})
