import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "fs";

const packageJson = JSON.parse(readFileSync("./package.json", "utf-8"));
const buildVersion = `${packageJson.version}-${Date.now()}`;

export default defineConfig({
  plugins: [
    react(),
    {
      name: "html-version",
      transformIndexHtml(html) {
        return html.replace(
          '<title>',
          `<meta name="version" content="${buildVersion}">\n    <title>`
        );
      },
    },
  ],
  define: {
    __APP_VERSION__: JSON.stringify(buildVersion),
  },
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
