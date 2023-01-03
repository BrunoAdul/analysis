import { defineConfig } from "vite";
import reactSWC from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [
    reactSWC(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"), // Use process.cwd() instead of __dirname
    },
  },
});
