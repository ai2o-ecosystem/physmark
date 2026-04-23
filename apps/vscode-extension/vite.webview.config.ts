import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/webview',
    rollupOptions: {
      input: resolve(__dirname, 'src/webview/index.html'),
    },
  },
  resolve: {
    alias: {
      '@physmark/core': resolve(__dirname, '../../packages/core/src/index.ts'),
      '@physmark/theme': resolve(__dirname, '../../packages/theme/src/index.ts'),
      '@physmark/fs-adapter': resolve(__dirname, '../../packages/fs-adapter/src/index.ts'),
      '@physmark/reader': resolve(__dirname, '../../packages/reader/src'),
      '@physmark/plugin-rapier': resolve(__dirname, '../../packages/plugin-rapier/src/index.tsx'),
    },
  },
});
