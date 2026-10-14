import type { NextConfig } from "next";

// DEMO_EXPORT=1 builds the home page as plain static files for GitHub Pages
// (see .github/workflows/demo.yml). The normal build needs the Java backend.
const demo = Boolean(process.env.DEMO_EXPORT);

const basePath = demo ? (process.env.PAGES_BASE_PATH ?? "") : "";

const nextConfig: NextConfig = {
  ...(demo ? { output: "export" as const, basePath } : {}),
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  experimental: {
    // Room for a 1 MB brand logo plus the rest of the form.
    serverActions: { bodySizeLimit: "2mb" },
  },
};

export default nextConfig;
