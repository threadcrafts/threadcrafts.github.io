import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// For GitHub Pages: set VITE_GH_PAGES=1 and VITE_BASE=/your-repo-name/ when building for deploy
const isGhPages = process.env.VITE_GH_PAGES === '1'
const base = isGhPages ? (process.env.VITE_BASE || '/string-art-app/') : '/'

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    rollupOptions: {
      output: {
        // Put the core algorithm in a separate chunk so it can be obfuscated post-build
        manualChunks(id) {
          if (id.includes('stringArt') || id.includes('bresenham')) return 'algorithm'
          return undefined
        },
      },
    },
  },
})
