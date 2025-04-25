import { defineConfig } from "vite";
import reactSWC from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === "production";

  return {
    base: "/sales/",
    server: {
      port: 8080,
      host: true,
    },
    plugins: [reactSWC()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
});
