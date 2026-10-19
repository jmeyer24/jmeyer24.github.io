import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: "/",
  plugins: [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        tonnetz: './projects/tonnetz/index.html',
        SAFE: './projects/SAFE/index.html',
        timeline: './projects/timeline/index.html',
      }
    }
  }
})
