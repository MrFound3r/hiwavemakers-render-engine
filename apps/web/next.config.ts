import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: require("path").join(__dirname, "../.."),
  },
  transpilePackages: ["@hiwave/remotion-engine", "@hiwave/templates"],
};

export default nextConfig;
