/* import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: 'all',
    proxy: {
      '/api': {
        target: 'http://localhost:5000',  // ← Tu servidor Flask
        changeOrigin: true,
        secure: false,
      },
    },
  },
}); */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: [
      '.ngrok-free.dev'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // ← Flask
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
