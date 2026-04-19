import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd()
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**.media.tumblr.com" },
      { protocol: "https", hostname: "64.media.tumblr.com" },
      { protocol: "https", hostname: "**.tumblr.com" },
      { protocol: "https", hostname: "**.wp.com" },
      { protocol: "https", hostname: "images.unsplash.com" }
    ]
  }
};

export default nextConfig;
