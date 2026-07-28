import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['ui', 'types'],
};

export default nextConfig;
