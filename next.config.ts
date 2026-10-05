import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Photos are pre-built as responsive WebP (npm run media:optimize) and
    // served as static files, so hosting never depends on an image optimizer
    // or its quota. See lib/image-loader.ts.
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
    deviceSizes: [640, 1280, 1920],
    imageSizes: [384],
    // Allow images stored in a Supabase Storage bucket (optional).
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' }],
  },
  async redirects() {
    // Old starter routes → current ones.
    return [
      { source: '/:locale/about', destination: '/:locale/story', permanent: true },
      { source: '/:locale/location', destination: '/:locale/visit', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
