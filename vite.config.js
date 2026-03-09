import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import process from "node:process";

function closePlugin() {
  return {
    name: "ClosePlugin",
    buildEnd(error) {
      if (error) {
        console.error("Error bundling", error);
        process.exit(1);
      }
    },
    closeBundle() {
      process.exit(0);
    },
  };
}

export default defineConfig({
  plugins: [react(), closePlugin()],

  server: {
    port: 3001,
    open: true,
    host: true,
  },
  base: "/",
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    reportCompressedSize: false,
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
