import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['ui', 'types'],
  turbopack: {
    // Pin the monorepo root so a package-lock.json in a parent folder isn't picked up instead.
    root: path.join(__dirname, '../..'),
  },
};

export default nextConfig;
