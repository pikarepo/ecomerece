import type { NextConfig } from 'next';

const allowed =
  process.env.NEXT_PUBLIC_ALLOWED_DEV_ORIGINS?.split(',')
    .map((s) => s.trim())
    .filter(Boolean) ?? [];
const rawApiBase = process.env.NEXT_PUBLIC_API_URL?.trim();
// A rewrite `destination` MUST be an absolute URL. Tolerate a scheme-less value
// (e.g. `localhost:8000`) from the environment so a stray `.env` entry cannot
// fail `next build` with "Invalid rewrite found".
const apiBase = rawApiBase
  ? /^https?:\/\//.test(rawApiBase)
    ? rawApiBase
    : `http://${rawApiBase}`
  : 'http://localhost:8000';
const nextConfig: NextConfig = {
  allowedDevOrigins: allowed,
  transpilePackages: [
    '@ecomerece/domain',
    '@ecomerece/shared',
    '@ecomerece/frontend',
    '@ecomerece/ui',
  ],
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@ecomerece/frontend'],
  },
  rewrites: async () => [
    {
      source: '/api/:path*',
      destination: `${apiBase}/:path*`,
    },
  ],
};

export default nextConfig;
