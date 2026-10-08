import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Verander dit als je GitHub-repository een andere naam heeft.
  base: '/woordjesavontuur/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Woordjesavontuur',
        short_name: 'Woordjes',
        description: 'Nederlandse woorden oefenen voor de basisschool',
        theme_color: '#0284c7',
        background_color: '#f0f9ff',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        lang: 'nl-NL',
        orientation: 'portrait-primary',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ]
})
