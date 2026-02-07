import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';



export default defineConfig(({ mode }) => ({
  plugins: [react()],

  // Environment-specific configurations
  define: {
    // Make environment variables available in your app
    __APP_ENV__: JSON.stringify(mode),
  },

  server: {
    port: 5173,
    proxy: {
      // Proxy API requests to backend during development
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // Optional: Proxy WebSocket
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
      }
    }
  },

  build: {
    outDir: 'dist',
    sourcemap: mode === 'development', // Only in dev
  }
}))