import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    host: true,
    port: 5173,
    open: '/index.html'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@js': path.resolve(__dirname, 'src/js'),
      '@data': path.resolve(__dirname, 'src/data'),
      '@assets': path.resolve(__dirname, 'src/assets')
    }
  },
  build: {
    rollupOptions: {
      input: {
        landing: path.resolve(__dirname, 'index.html'),
        app: path.resolve(__dirname, 'app.html')
      }
    }
  }
});
