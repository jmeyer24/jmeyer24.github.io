import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  base: "/",
  plugins: [
    tailwindcss(),
  ],
  // Access points for main and projects
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        tonnetz: './projects/tonnetz/index.html',
        SAFE: './projects/SAFE/index.html',
      }
    }
  },
  // Creates an Alias
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  // No SPA-Fallback für unresolved paths (-> 404 error like on github pages)
  appType: 'mpa',
})
