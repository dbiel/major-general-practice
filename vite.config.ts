import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["audio/*.mp3", "manifest-icons/*"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,mp3,png,svg,webmanifest}"],
        // Audio files can be large — bump limit.
        maximumFileSizeToCacheInBytes: 25 * 1024 * 1024,
      },
      manifest: {
        name: "Major-General Practice",
        short_name: "MajorGen",
        description: "Snowball-pattern memorization drill for the Major-General song",
        theme_color: "#0a0a0a",
        background_color: "#0a0a0a",
        display: "standalone",
        orientation: "portrait",
        icons: [
          { src: "/manifest-icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/manifest-icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/manifest-icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
  },
});
