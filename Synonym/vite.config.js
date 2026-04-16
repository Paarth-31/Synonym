import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // './' so asset paths work when Electron loads the built index.html from disk
  base: './',

  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },

  server: {
    port: 5173,
    strictPort: true,   // fail loudly if 5173 is taken instead of picking a random port
  },
});