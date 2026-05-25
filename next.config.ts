import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  /* Image optimization with custom ImageKit loader */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.imagekit.io',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Enable AVIF format for better compression
    formats: ['image/avif', 'image/webp'],
    // Optimize images aggressively
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Cache optimized images for 1 year in CDN/browser
    minimumCacheTTL: 31536000, // 1 year
  },

  /* Compression and bundling optimizations */
  compress: true,

  /* Production source maps - disabled for smaller bundle size */
  productionBrowserSourceMaps: false,

  /* Experimental features for performance */
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      'lucide-react',
      'framer-motion',
    ],
  },

  /* TypeScript configuration */
  typescript: {
    tsconfigPath: './tsconfig.json',
  },

  /* Turbopack config for Next.js 16 */
  turbopack: {},
};

export default withNextIntl(nextConfig);


