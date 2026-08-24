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
        'apple-touch-icon-120.png',
        'apple-touch-icon-152.png',
        'offline.html',
        'brand/trip2talk-badge.png',
        'brand/trip2talk-badge.webp',
        'brand/trip2talk-og.jpg',
        'splash/*.png',
      ],
      manifest: {
        name: 'Trip2Talk',
        short_name: 'Trip2Talk',
        description: 'Private photo journeys for Thai travelers in Australia',
        lang: 'en',
        dir: 'ltr',
        id: '/',
        start_url: '/',
        scope: '/',
        theme_color: '#16262b',
        background_color: '#16262b',
        display: 'standalone',
        display_override: ['standalone', 'fullscreen'],
        orientation: 'portrait-primary',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: '/icon-192-maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Do not use navigateFallback:'index.html' (stale hashed JS) or a catch-all
        // NavigationRoute to offline.html (that would serve offline on every visit).
        // Navigations: NetworkFirst pages-cache; PrecacheFallbackPlugin → offline.html.
        globPatterns: ['**/*.{js,css,ico,png,svg,jpg,jpeg,webp}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: '',
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 24, maxAgeSeconds: 7 * 24 * 60 * 60 },
              precacheFallback: { fallbackURL: '/offline.html' },
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
