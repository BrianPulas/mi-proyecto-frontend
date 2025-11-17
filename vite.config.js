import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // --- ¡AÑADE ESTA SECCIÓN "SERVER"! ---
  server: {
    proxy: {
      // Si la petición empieza con '/api'
      '/api': {
        // Redirígela a tu servidor backend
        target: 'http://localhost:3000', 
        changeOrigin: true,
      },
    }
  }
  // --- FIN DE LA SECCIÓN AÑADIDA ---
})