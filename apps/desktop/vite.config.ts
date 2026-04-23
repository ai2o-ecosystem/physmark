import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: 'chrome105',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
  resolve: {
    alias: {
      '@physmark/core': new URL('../../packages/core/src/index.ts', import.meta.url).pathname,
      '@physmark/theme': new URL('../../packages/theme/src/index.ts', import.meta.url).pathname,
      '@physmark/fs-adapter': new URL('../../packages/fs-adapter/src/index.ts', import.meta.url).pathname,
      '@physmark/reader': new URL('../../packages/reader/src', import.meta.url).pathname,
      '@physmark/plugin-rapier': new URL('../../packages/plugin-rapier/src/index.tsx', import.meta.url).pathname,
    },
  },
});
