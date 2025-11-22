import { defineConfig } from 'vite';
// @ts-expect-error - TypeScript module resolution issue in Vercel builds
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import * as path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          // React Compiler - will be available when released
          // ['babel-plugin-react-compiler', {}],
        ],
      },
    }),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Freedom Fighters',
        short_name: 'FF',
        description: 'Freedom Fighters event management',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
