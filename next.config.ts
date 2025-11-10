// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable the React Compiler if you want automatic memoization support
  reactCompiler: true,

  // Enable “Cache Components” if you plan to use the new caching APIs / use cache directive
  cacheComponents: true,

  // TailwindCSS & TypeScript are supported out-of-the-box, so no extra config needed for them here

  // (Optional) Custom image config or aliasing, only add if you need it
  images: {
    // Example: allow remote patterns or local query strings
    // remotePatterns: [
    //   { protocol: "https", hostname: "example.com" }
    // ],
    // localPatterns: [
    //   { pathname: "/assets/**", search: "?v=*" }
    // ],
  },

  // Export the config
  // You can add more options here as your app grows
};

export default nextConfig;
