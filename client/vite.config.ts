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

// This project's components use JSX inside plain .js files (App.js,
// Sidebar.js, every features/pages file, etc.) rather than .jsx. Vite's
// default esbuild loader for .js is plain JS, not JSX, so without this
// the dev server/build fails to parse any of them ("Expression expected").
// Scoped to src/**/*.js only, so .ts/.tsx (e.g. main.tsx) keep using
// Vite's normal TypeScript transform untouched.
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

  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  assetsInclude: ["**/*.svg", "**/*.csv"],
})
