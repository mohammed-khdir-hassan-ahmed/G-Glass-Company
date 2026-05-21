/**
 * Custom ImageKit Loader for Next.js Image Component
 * Handles dynamic resizing, quality optimization, and format negotiation via URL transformations
 */

import { ImageLoaderProps } from 'next/image';

const IMAGEKIT_URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '';

export const imageKitLoader = ({ src, width, quality }: ImageLoaderProps): string => {
  // Return the path as-is if it's already a full URL from ImageKit
  if (src.startsWith('http')) {
    return src;
  }

  // Build ImageKit transformation URL
  const params = new URLSearchParams();

  // Width transformation
  if (width) {
    params.append('w', width.toString());
  }

  // Quality optimization (1-100)
  // Lower quality for thumbnails (60), higher for details (80)
  const q = quality || (width && width < 400 ? 60 : 80);
  params.append('q', q.toString());

  // Format negotiation - use webp for better compression
  params.append('f', 'webp');

  // Progressive JPEG as fallback
  params.append('pr', 'true');

  // Cache control - 30 days expiry (static timestamp)
  // Use a fixed long-term expiry to avoid hydration mismatches
  params.append('e', '2147483647');  // Unix timestamp year 2038

  // Automatic trimming for consistent aspect ratios
  params.append('c', 'at');

  // Optimize for mobile - reduce DPI for smaller screens
  if (width && width < 768) {
    params.append('dpr', 'auto'); // Auto DPI scaling
  }

  const queryString = params.toString();
  const separator = src.includes('?') ? '&' : '?';

  return `${IMAGEKIT_URL_ENDPOINT}${src}${separator}${queryString}`;
};

/**
 * Get responsive image sizes based on viewport
 * Used with the 'sizes' attribute for optimal performance
 */
export const getResponsiveSizes = (type: 'thumbnail' | 'detail' | 'full'): string => {
  switch (type) {
    case 'thumbnail':
      // For grid items
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw';
    case 'detail':
      // For modal/detail view
      return '(max-width: 640px) 90vw, (max-width: 1024px) 80vw, 600px';
    case 'full':
      // For full width items
      return '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px';
    default:
      return '100vw';
  }
};
