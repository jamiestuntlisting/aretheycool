import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/aretheycool/', // <-- Re-enable this line for deployment build
  plugins: [react()],
  build: {
    outDir: 'docs' // Specify the output directory as docs
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
}); 