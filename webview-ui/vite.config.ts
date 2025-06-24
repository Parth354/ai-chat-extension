import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  // Ensures all asset paths in the HTML reference the current directory relative to the webview's base
  base: './', 
  plugins: [react()],
  build: {
    // Specifies the output directory for the build.
    // resolve(__dirname, '../media') will go up one level from 'webview-ui'
    // to the extension's root, then into the 'media' folder.
    outDir: resolve(__dirname, '../media'), 
    // Cleans the output directory before building
    emptyOutDir: true, 
    rollupOptions: {
      // Defines the entry point for Rollup. This is your main React application file.
      input: {
        main: resolve(__dirname, 'src/main.tsx'), 
      },
      output: {
        // Sets the filename for the main JavaScript bundle (e.g., 'main.tsx' will become 'index.js')
        entryFileNames: 'index.js', 
        // Sets the naming convention for other assets (like CSS files)
        assetFileNames: '[name].[ext]' 
      }
    }
  },
  // Polyfill 'global' for compatibility if needed in certain environments
  define: {
    global: 'globalThis',
  }
});
