import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // loaders.gl (a deck.gl transitive dependency) references worker_threads
      // and fs conditionally. These don't exist in the browser.
      worker_threads: "",
      fs: "",
    },
  },
};

export default nextConfig;
