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
  // Caching (perf audit): `/skins/*.css` was served with no Cache-Control, so
  // the render-blocking active-skin stylesheet revalidated on every visit
  // (worst on phones). Skin filenames are stable across builds, so the first
  // paint may reuse bytes briefly — BUT the window is kept SHORT and the
  // runtime revalidates with `cache: 'no-cache'` on every load, so a newly
  // deployed skin replaces the old one on the next visit instead of sticking
  // around for a day (the old SWR=86400 did exactly that).
  headers: async () => [
    {
      source: '/skins/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=300, stale-while-revalidate=3600',
        },
      ],
    },
    {
      // Static public assets (svgs, favicons, fonts) are content-stable.
      source: '/:file((?:[^/]+)\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|woff2|woff|ttf|otf))',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=86400, stale-while-revalidate=604800',
        },
      ],
    },
  ],
};

export default nextConfig;
