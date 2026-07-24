import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import VitePluginSitemap from "vite-plugin-sitemap";

const baseUrl = "https://cockroachhub.lol";
const staticPaths = [
  "/",
  "/emergency",
  "/live-feed",
  "/legal-rights",
  "/fact-check",
  "/submit",
  "/first-aid",
  "/sos",
  "/torch",
  "/checklist",
  "/safe-zones",
  "/bail-info",
  "/manifesto",
  "/about",
  "/privacy",
  "/evidence",
  "/admin/login",
];

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "og-image.png"],
      manifest: {
        name: "CockroachHub — Student Protest Support Network",
        short_name: "CockroachHub",
        description: "Emergency resource hub for student protesters in India — legal aid, live field updates, Know Your Rights, fact checking. Zero data collection. Offline-ready PWA.",
        theme_color: "#800000",
        background_color: "#f5f5f5",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        categories: ["education", "social", "utilities"],
        iarc_rating_id: "e8c5a2e7-8b3c-4a9d-9f1e-2b6d7c8a9e0f",
        screenshots: [
          { src: "/og-image.png", sizes: "1200x630", type: "image/png", form_factor: "wide" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", form_factor: "narrow" },
        ],
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/emergency-contacts/,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "emergency-contacts", expiration: { maxEntries: 10, maxAgeSeconds: 86400 } },
          },
          {
            urlPattern: /^https?:\/\/.*\/api\/legal-rights/,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "legal-rights", expiration: { maxEntries: 10, maxAgeSeconds: 86400 } },
          },
        ],
      },
    }),
    VitePluginSitemap({
      hostname: baseUrl,
      dynamicRoutes: staticPaths,
      exclude: ["/admin/*"],
      changefreq: "daily",
      priority: 0.7,
      lastmod: new Date().toISOString().split("T")[0],
      robotsTxtOptions: {
        policies: [{ userAgent: "*", allow: "/" }],
      },
    }),
  ],
  server: {
    proxy: { "/api": "http://localhost:8228" },
  },
});
