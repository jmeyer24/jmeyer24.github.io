import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { globSync } from 'glob';

// find all .html files of projects (and the root one)
const htmlFiles = globSync('**/index.html', {
  ignore: ['dist/**', 'node_modules/**']
});
const rollupInput = {};
htmlFiles.forEach((file) => {
  const key = file.replace(/\.html$/, '');
  rollupInput[key] = path.resolve(__dirname, file);
});

export default defineConfig({
  base: "/",
  plugins: [
    tailwindcss(),
  ],
  // Access points for main and projects
  build: {
    rollupOptions: {
      input: rollupInput
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
