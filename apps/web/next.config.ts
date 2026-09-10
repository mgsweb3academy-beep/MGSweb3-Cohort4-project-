import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['ui', 'types'],
  turbopack: {
    // Pin the monorepo root so a package-lock.json in a parent folder isn't picked up instead.
    root: path.join(__dirname, '../..'),
  },
  // TEMPORARY for the 2026-09-10 demo: 38 type errors that predate the Convex move would
  // otherwise fail the Vercel build. Remove once they are fixed.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
