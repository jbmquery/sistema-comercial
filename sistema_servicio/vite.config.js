import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ['0a30efe12193.ngrok-free.app'],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',  // ← Tu servidor Flask
        changeOrigin: true,
        secure: false,
      },
    },
  },
});