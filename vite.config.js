import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Case-insensitive path resolver plugin
function caseInsensitivePathsPlugin() {
  return {
    name: 'case-insensitive-paths',
    enforce: 'pre',
    resolveId(source, importer) {
      // Skip for absolute paths, external modules, and virtual modules
      if (!importer || path.isAbsolute(source) || source.startsWith('\0') || !source.startsWith('.')) {
        return null
      }

      try {
        const importerDir = path.dirname(importer)
        const targetPath = path.resolve(importerDir, source)
        
        // Try direct resolution first
        if (fs.existsSync(targetPath)) {
          return null // Let Vite handle it normally
        }

        // Try with extensions
        const extensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.mjs']
        for (const ext of extensions) {
          if (fs.existsSync(targetPath + ext)) {
            return null
          }
        }

        // Case-insensitive search
        const dir = path.dirname(targetPath)
        const basename = path.basename(targetPath)
        
        if (!fs.existsSync(dir)) {
          return null
        }

        const files = fs.readdirSync(dir)
        
        // Look for exact filename match (case-insensitive)
        let match = files.find(f => f.toLowerCase() === basename.toLowerCase())
        
        if (match) {
          return path.join(dir, match)
        }

        // Look for filename with extension (case-insensitive)
        for (const ext of extensions) {
          const basenameWithExt = basename + ext
          match = files.find(f => f.toLowerCase() === basenameWithExt.toLowerCase())
          
          if (match) {
            return path.join(dir, match)
          }
        }

        // Check if it's a directory with index file
        match = files.find(f => f.toLowerCase() === basename.toLowerCase())
        if (match) {
          const indexDir = path.join(dir, match)
          if (fs.statSync(indexDir).isDirectory()) {
            const indexFiles = fs.readdirSync(indexDir)
            for (const ext of extensions) {
              const indexMatch = indexFiles.find(f => f.toLowerCase() === `index${ext}`.toLowerCase())
              if (indexMatch) {
                return path.join(indexDir, indexMatch)
              }
            }
          }
        }
      } catch (error) {
        // Ignore errors and let Vite's default resolver handle it
        console.error(error)
      }

      return null
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    caseInsensitivePathsPlugin()
  ],
  server: {
    port: 3001,
    open: true,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  css: {
    devSourcemap: true,
  },
})