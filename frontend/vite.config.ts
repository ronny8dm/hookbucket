import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    optimizeDeps: {
      include: ["@mui/material/Unstable_Grid2"],
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: env.AUTH_URL, 
          changeOrigin: true,
        },
        "/auth": {
          target: env.AUTH_URL, 
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on("error", (err) => {
              console.error("Proxy Error:", err);
            });
            proxy.on("proxyRes", (proxyRes) => {
              if (proxyRes.headers.location) {
                const originalLocation = proxyRes.headers.location;
                proxyRes.headers.location = originalLocation.replace(
                  env.AUTH_URL,
                  env.FRONTEND_URL 
                );
              }
            });
          },
        },
      },
      allowedHosts: true,
      hmr: { overlay: true },
      watch: { usePolling: true },
    },
  };
});
