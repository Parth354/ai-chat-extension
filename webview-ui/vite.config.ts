import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [react(),
  tailwindcss()],
  build: {
    outDir: resolve(__dirname, '../media'),
    emptyOutDir: true,
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/main.tsx'),
      },
      output: {
        entryFileNames: 'index.js',
        assetFileNames: '[name].[ext]',
      }
    }
  },
  define: {
    global: 'globalThis',
  }
});
