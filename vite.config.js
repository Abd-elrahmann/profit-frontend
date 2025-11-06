import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function caseInsensitivePathsPlugin() {
  return {
    name: 'case-insensitive-paths',
    enforce: 'pre',
    
    // Handle both static and dynamic imports
    resolveId(source, importer, options) {
      if (!importer || !source.startsWith('./') && !source.startsWith('../')) {
        return null
      }

      try {
        const importerDir = path.dirname(importer)
        let targetPath = path.resolve(importerDir, source)
        
        // Function to find case-insensitive match
        const findCaseInsensitive = (filePath) => {
          const dir = path.dirname(filePath)
          const basename = path.basename(filePath)
          
          if (!fs.existsSync(dir)) return null
          
          const files = fs.readdirSync(dir)
          const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '.json', '.mjs']
          
          for (const ext of extensions) {
            const targetName = basename + ext
            const match = files.find(f => f.toLowerCase() === targetName.toLowerCase())
            
            if (match) {
              const fullPath = path.join(dir, match)
              if (fs.existsSync(fullPath)) {
                const stat = fs.statSync(fullPath)
                if (stat.isFile()) {
                  return fullPath
                } else if (stat.isDirectory()) {
                  // Check for index files
                  const indexExtensions = ['.js', '.jsx', '.ts', '.tsx']
                  for (const idxExt of indexExtensions) {
                    const indexPath = path.join(fullPath, `index${idxExt}`)
                    if (fs.existsSync(indexPath)) {
                      return indexPath
                    }
                  }
                }
              }
            }
          }
          return null
        }

        const resolved = findCaseInsensitive(targetPath)
        if (resolved) {
          return resolved
        }
      } catch (error) {
        console.error('Case-insensitive resolution error:', error.message)
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
    rollupOptions: {
      // Ensure external modules aren't bundled
      external: [],
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  css: {
    devSourcemap: true,
  },
})