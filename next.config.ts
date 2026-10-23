import type { NextConfig } from "next";

// Cache Components kapalı: panelin tüm sayfaları kullanıcıya özel ve dinamik
// (docs/03-MIMARI.md, ADR 10).
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
