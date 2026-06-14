import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // ── PWA PLUGIN ──────────────────────────────────────────────────────────
    // Auto-updates the service worker whenever a new build is deployed to Vercel.
    VitePWA({
      registerType: 'autoUpdate',

      // Assets to pre-cache during service worker installation
      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'favicon-16x16.png',
        'favicon-32x32.png',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'offline.html',
      ],

      // Web App Manifest — controls how the app looks when installed
      manifest: {
        name: 'COMSATS Cafe',
        short_name: 'COMSATS Cafe',
        description: 'Campus cafeteria ordering — browse menus, place orders and track pickups',

        // Exact colors from tailwind.config.js theme
        theme_color: '#121222',       // dark background — keeps splash screen branded
        background_color: '#121222',  // surface: deep navy/dark background

        display: 'standalone',         // hides browser chrome — feels like a native app
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/pwa-start',  // Smart redirect: checks auth → goes to right portal
        lang: 'en',
        categories: ['food', 'shopping', 'lifestyle'],

        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            // Maskable = adaptive icon for Android (respects safe-zone)
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],

        screenshots: [
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'COMSATS Cafe Home',
          },
        ],
      },

      // ── WORKBOX (Service Worker caching strategy) ────────────────────────
      workbox: {
        // Pre-cache all JS, CSS, HTML, and static assets at install time
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],

        // Don't override navigation — let React Router handle all routes
        // Offline is handled by the NetworkFirst strategy timing out
        navigateFallback: null,

        // ── DO NOT CACHE — must always hit network: ──────────────────────
        // Auth endpoints, order placement, and payment endpoints are excluded
        // by the NetworkOnly handler below so they always use fresh responses.
        navigationPreload: false,

        runtimeCaching: [
          // ── NEVER CACHE: Auth / order / payment endpoints ──────────────
          {
            urlPattern: ({ url }) =>
              url.pathname.includes('/auth/') ||
              url.pathname.includes('/login') ||
              url.pathname.includes('/orders') ||
              url.pathname.includes('/payments') ||
              url.pathname.includes('/checkout'),
            handler: 'NetworkOnly', // always fresh — no caching
          },

          // ── Supabase API responses (NetworkFirst) ──────────────────────
          // Try network first; fall back to cache if offline (10s timeout)
          {
            urlPattern: ({ url }) => url.hostname.includes('supabase.co'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // ── Images / media (CacheFirst) ────────────────────────────────
          // Images rarely change — serve from cache, update in background
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 150,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // ── Google Fonts (CacheFirst) ──────────────────────────────────
          // Fonts are versioned and immutable — cache for a year
          {
            urlPattern: ({ url }) =>
              url.hostname === 'fonts.googleapis.com' ||
              url.hostname === 'fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // ── JS & CSS chunks (StaleWhileRevalidate) ─────────────────────
          // Serve cached version immediately, fetch update in background
          {
            urlPattern: ({ request }) =>
              request.destination === 'script' ||
              request.destination === 'style',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },

      // ── DEV OPTIONS ──────────────────────────────────────────────────────
      // Set enabled: true temporarily to test PWA locally (npm run dev)
      // Always set back to false before committing — slows dev HMR
      devOptions: {
        enabled: false,
        type: 'module',
      },
    }),
    // ── END PWA PLUGIN ───────────────────────────────────────────────────────
  ],

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@supabase')) return 'supabase';
          if (id.includes('node_modules/framer-motion')) return 'motion';
          if (id.includes('node_modules/react-router') || id.includes('node_modules/react-dom')) return 'vendor';
        },
      },
    },
  },

  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
