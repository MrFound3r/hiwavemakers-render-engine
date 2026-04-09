import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: require("path").join(__dirname, "../.."),
  },
};

export default nextConfig;
