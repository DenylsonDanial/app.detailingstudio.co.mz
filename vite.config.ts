import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon/favicon.ico',
        'favicon/apple-touch-icon.png',
        'favicon/android-chrome-192x192.png',
        'favicon/android-chrome-512x512.png',
      ],
      manifest: {
        name: 'Detailing Studio',
        short_name: 'Detailing Studio',
        description:
          'Sistema de gestão do Detailing Studio: entradas de viaturas, serviços, pagamentos, conta corrente e despesas.',
        display: 'standalone',
        start_url: '/',
        theme_color: '#CA0278',
        background_color: '#ffffff',
        icons: [
          {
            src: 'favicon/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'favicon/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        // Minimal caching — enough for installability, not full offline API.
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        // Separa as bibliotecas grandes do codigo da aplicacao para o bundle
        // inicial nao ser invalidado a cada deploy.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/system', '@mui/lab', '@mui/x-date-pickers'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
        },
      },
    },
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8095,
    host: true,
  },
  preview: {
    port: 8095,
  },
});
