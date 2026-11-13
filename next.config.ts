import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // There is another lockfile above this folder; pin the tracing root to the app.
  outputFileTracingRoot: path.join(process.cwd()),
};

export default nextConfig;
