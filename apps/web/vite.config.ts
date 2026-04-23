import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      manifest: {
        name: 'PhysMark',
        short_name: 'PhysMark',
        description: 'Interactive physics simulations in Markdown',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        file_handlers: [
          {
            action: '/',
            accept: { 'text/markdown': ['.md'] },
          },
        ],
      },
    }),
  ],
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
