import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [480, 768, 1080, 1440, 1920],
    imageSizes: [320, 480, 640],
  },
  poweredByHeader: false,
};

export default nextConfig;
