import type { NextConfig } from "next";

// DEMO_EXPORT=1 builds the home page as plain static files for GitHub Pages
// (see .github/workflows/demo.yml). The normal build needs the Java backend.
const demo = Boolean(process.env.DEMO_EXPORT);

const basePath = demo ? (process.env.PAGES_BASE_PATH ?? "") : "";

const nextConfig: NextConfig = {
  // Demo: folder-style URLs (/catalog/kitchens/) so GitHub Pages can serve every page.
  // Server: a self-contained build for the Docker image (see frontend/Dockerfile).
  ...(demo ? { output: "export" as const, basePath, trailingSlash: true } : { output: "standalone" as const }),
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  experimental: {
    // Admin uploads go through server actions. Allow a little more than the
    // backend's own 55 MB request limit, so oversized uploads get the
    // backend's readable error instead of a framework error page.
    serverActions: { bodySizeLimit: "60mb" },
  },
};

export default nextConfig;
