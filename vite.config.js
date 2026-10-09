import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
export default defineConfig({
  base: '/woordjesavontuur/',
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    manifest: {name:'Woordjesavontuur',short_name:'Woordjes',description:'Woorden en betekenissen oefenen',theme_color:'#0284c7',background_color:'#f0f9ff',display:'standalone',start_url:'.',scope:'.',lang:'nl-NL'},
    workbox: {globPatterns:['**/*.{js,css,html,png,svg,woff2}']}
  })]
})