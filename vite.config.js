import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
  ],

  server: {
    port: 3001,
    open: true,
    host: true,
  },
  base: "/",
  build: {
    outDir: "dist",
    sourcemap: true,
    minify: "esbuild",
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: { 
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
        manualChunks: {
          react: ["react", "react-dom"],
          mui: ["@mui/material", "@mui/icons-material"],
          lodash: ["lodash"],
        },
      },
    },
  },
});
