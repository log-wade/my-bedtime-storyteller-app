import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.gutenberg.org", pathname: "/**" },
      { protocol: "https", hostname: "www.gutenberg.org", pathname: "/cache/epub/**" },
    ],
  },
};

export default nextConfig;
