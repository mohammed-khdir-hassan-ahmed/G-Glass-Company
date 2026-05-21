/**
 * ImageKit URL optimization utility
 * Adds WebP compression, quality settings, and caching for best performance
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number; // 1-100, default 80 is best balance
  format?: 'webp' | 'auto'; // auto serves webp to browsers that support it
}

/**
 * Generate optimized ImageKit URL with WebP compression and caching
 * @param imagePath - ImageKit file path (e.g., /miwani-mawlawi/image.jpg)
 * @param options - Optimization options (width, height, quality, format)
 * @returns Optimized URL with transformation parameters
 */
export function getOptimizedImageUrl(
  imagePath: string,
  options: ImageOptimizationOptions = {}
): string {
  const {
    width,
    height,
    quality = 75, // Best compression while maintaining quality
    format = 'webp', // Use WebP for best compression
  } = options;

  // Build transformation parameters
  const params = new URLSearchParams();
  
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  
  // Quality settings: use 'q' parameter for quality
  params.append('q', quality.toString());
  
  // Format: Use 'f' for format (webp, auto, jpg, etc.)
  params.append('f', format);
  
  // Add cache control: set long expiry for cached images
  params.append('e', '2147483647'); // Max cache duration
  
  // Optimize for web: automatically crop to aspect ratio if width&height provided
  if (width && height) {
    params.append('c', 'at'); // Automatic trimming
  }

  // Add progressive JPEG encoding if not WebP
  if (format !== 'webp') {
    params.append('pr', 'true');
  }

  const queryString = params.toString();
  return `${imagePath}?${queryString}`;
}

/**
 * Get WebP URL for gallery thumbnails
 * Best for: Menu grid items (small, quick load)
 * Cached for 365 days
 */
export function getThumbnailUrl(imagePath: string): string {
  return getOptimizedImageUrl(imagePath, {
    width: 300,
    height: 200,
    quality: 70, // Lower quality acceptable for thumbnails
    format: 'webp',
  });
}

/**
 * Get WebP URL for modal/detail views
 * Best for: Item detail dialogs (larger, but still optimized)
 * Cached for 365 days
 */
export function getDetailImageUrl(imagePath: string): string {
  return getOptimizedImageUrl(imagePath, {
    width: 600,
    height: 400,
    quality: 80, // Higher quality for detail view
    format: 'webp',
  });
}

/**
 * Get WebP URL for dashboard admin preview
 * Best for: Admin dashboard (full size, high quality)
 * Cached for 365 days
 */
export function getAdminImageUrl(imagePath: string): string {
  return getOptimizedImageUrl(imagePath, {
    width: 800,
    height: 600,
    quality: 85,
    format: 'webp',
  });
}
