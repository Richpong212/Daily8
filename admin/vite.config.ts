import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  // 1. Load all env vars from .env, .env.development, .env.production, etc.
  const env = loadEnv(mode, process.cwd(), "");

  const apiTarget = mode === "development" ? "http://localhost:5010" : env.VITE_API_URL;

  return {
    preview: {
      port: 3004,
      proxy: {
        "/api": {
          target: mode === "development" ? "http://localhost:5010" : env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
        "/public-og": {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          // maps /public-og/:slug  ->  /api/v1/public-og/:slug
          rewrite: (path) => path.replace(/^\/public-og/, "/api/v1/public-og"),
        },
      },
    },
    server: {
      host: "::",
      port: 3004,
      proxy: {
        "/api": {
          target: mode === "development" ? "http://localhost:5010" : env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
        "/public-og": {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          // maps /public-og/:slug  ->  /api/v1/public-og/:slug
          rewrite: (path) => path.replace(/^\/public-og/, "/api/v1/public-og"),
        },
      },
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
