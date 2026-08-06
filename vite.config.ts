import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Registration lives in src/pwa.ts via virtual:pwa-register (reload + update checks).
      injectRegister: null,
      includeAssets: [
        'favicon.ico',
        'favicon-16.png',
        'favicon-32.png',
        'apple-touch-icon.png',
        'brand/trip2talk-badge.png',
        'brand/trip2talk-badge.webp',
        'brand/trip2talk-og.jpg',
      ],
      manifest: {
        name: 'Trip2Talk - Thai Photo Tours Australia',
        short_name: 'Trip2Talk',
        description: 'Private photo journeys for Thai travelers in Australia',
        theme_color: '#16262b',
        background_color: '#16262b',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Never precache HTML — a pinned index.html keeps old hashed JS forever.
        globPatterns: ['**/*.{js,css,ico,png,svg,jpg,jpeg,webp}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // Override vite-plugin-pwa default navigateFallback:'index.html' (empty = disabled).
        // Navigations use NetworkFirst pages-cache below so clients can fetch a fresh shell.
        navigateFallback: '',
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 10, maxAgeSeconds: 60 },
            },
          },
          {
            // Canonical Supabase project: trip2talk-official (bljhnelgmkulxwuhedbi)
            urlPattern: /^https:\/\/bljhnelgmkulxwuhedbi\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
        ],
      },
    }),
  ],
})
