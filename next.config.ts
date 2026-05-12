// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["tesseract.js"], // Next.js 15+
  // If you're on Next.js 14, use this instead:
  // experimental: {
  //   serverComponentsExternalPackages: ['tesseract.js'],
  // },

  outputFileTracingIncludes: {
    "/api/**/*": ["./node_modules/**/*.wasm", "./node_modules/**/*.proto"],
  },
};

export default nextConfig;
