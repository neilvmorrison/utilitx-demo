import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // loaders.gl (a deck.gl transitive dependency) references worker_threads
      // and fs conditionally. Tell Webpack these don't exist in the browser.
      config.resolve.fallback = {
        ...config.resolve.fallback,
        worker_threads: false,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
