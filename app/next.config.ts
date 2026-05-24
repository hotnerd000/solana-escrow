import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Stable top-level key for modern Next.js environments
  turbopack: {
    // Explicitly overrides workspace lockfile inference bugs
    root: path.resolve(__dirname, "../"), 
    
    // Redirects browser imports safely away from missing native Node APIs
    resolveAlias: {
      fs: { browser: path.resolve(__dirname, "./empty.ts") },
      net: { browser: path.resolve(__dirname, "./empty.ts") },
      tls: { browser: path.resolve(__dirname, "./empty.ts") },
      crypto: { browser: path.resolve(__dirname, "./empty.ts") },
      stream: { browser: path.resolve(__dirname, "./empty.ts") },
      path: { browser: path.resolve(__dirname, "./empty.ts") },
    },
  },
};

export default nextConfig;
