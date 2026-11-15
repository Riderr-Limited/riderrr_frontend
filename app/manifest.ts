import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/app",
    name: "Riderr",
    short_name: "Riderr",
    description: "Send packages, run errands and order pay-on-delivery. Riders can go online and take jobs.",
    start_url: "/app?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#175acc",
    categories: ["business", "productivity", "shopping"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Send a package", url: "/app/send", icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }] },
      { name: "My deliveries", url: "/app/deliveries", icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }] },
    ],
  };
}
