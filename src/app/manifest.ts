// src/app/manifest.ts
// Next.js serves this at /manifest.webmanifest automatically.
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BlueMind Litter Mapping",
    short_name: "BlueMind",
    description:
      "Document litter you find, build an open pollution dataset, and earn eco badges.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f0f9ff",
    theme_color: "#0ea5e9",
    categories: ["utilities", "lifestyle", "education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
