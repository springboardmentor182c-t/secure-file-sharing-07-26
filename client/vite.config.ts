import { defineConfig, transformWithEsbuild } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

function jsxInJsFiles() {
  return {
    name: 'jsx-in-js-files',
    async transform(code, id) {
      if (!id.includes('/src/') || !id.endsWith('.js')) return null
      return transformWithEsbuild(code, id, { loader: 'jsx', jsx: 'automatic' })
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    jsxInJsFiles(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
