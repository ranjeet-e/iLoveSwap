import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        popup: resolve(import.meta.dirname, 'popup.html'),
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    open: false,
  },
});
