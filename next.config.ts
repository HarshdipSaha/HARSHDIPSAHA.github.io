import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Still a static export: the site has no server-side needs, and GitHub Pages
  // keeps deploying it unchanged. Nothing in the design depends on this.
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
