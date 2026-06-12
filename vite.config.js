import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

const apps = {
  customer: {
    input: "customer.html",
    outDir: "dist/customer",
    pwa: {
      name: "Kodos - Food Delivery",
      short_name: "Kodos",
      description: "Fresh food, delivered fast",
      theme_color: "#ff6b35",
      start_url: "/",
    },
  },
  admin: {
    input: "admin.html",
    outDir: "dist/admin",
    pwa: {
      name: "Kodos Admin",
      short_name: "Kodos Admin",
      description: "Admin panel for Kodos",
      theme_color: "#2c3e50",
      start_url: "/",
    },
  },
  driver: {
    input: "driver.html",
    outDir: "dist/driver",
    pwa: {
      name: "Kodos Driver",
      short_name: "Kodos Driver",
      description: "Delivery driver app for Kodos",
      theme_color: "#27ae60",
      start_url: "/",
    },
  },
};

export default defineConfig(({ mode }) => {
  const appName = process.env.VITE_APP || "customer";
  const app = apps[appName];

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.png"],
        workbox: {
          navigateFallback: `/${app.input.replace(/\.html$/, "")}.html`,
          globPatterns: ["**/*.{js,css,html,png,json,webmanifest}"],
        },
        manifest: {
          name: app.pwa.name,
          short_name: app.pwa.short_name,
          description: app.pwa.description,
          theme_color: app.pwa.theme_color,
          background_color: "#f8f9fa",
          display: "standalone",
          orientation: "portrait",
          start_url: app.pwa.start_url,
          icons: [
            {
              src: "/icons/icon-192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/icons/icon-512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
    ],
    build: {
      outDir: app.outDir,
      rollupOptions: {
        input: path.resolve(__dirname, app.input),
      },
    },
  };
});
