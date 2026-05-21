/**
 * Optimized Menu Item Component
 * 
 * Performance optimizations:
 * - Lazy loading for below-fold images (priority=false)
 * - Priority loading for above-fold images (priority=true, index < 4)
 * - Blur placeholder (LQIP) for instant visual feedback
 * - Quality optimization: 70 for thumbnails instead of 85
 * - Responsive image sizing with proper srcset
 * 
 * Expected performance:
 * - First 4 items (above fold): load immediately with priority
 * - Remaining items: lazy load on viewport entry
 * - Perceived speed: instant image placeholders while real images load
 */

'use client';

import Image from 'next/image';
import { imageKitLoader, getResponsiveSizes } from '@/lib/imagekit-loader';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { type MenuItem } from '@/lib/db';

interface OptimizedMenuItemProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
  priority?: boolean;
  index?: number;
}

function normalizeSizes(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((size) => String(size).trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed
          .map((size) => String(size).trim())
          .filter(Boolean);
      }
    } catch {
      return value
        .split(',')
        .map((size) => size.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function normalizeColors(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(color => typeof color === 'string' && color.match(/^#[0-9A-F]{6}$/i));
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter(color => typeof color === 'string' && color.match(/^#[0-9A-F]{6}$/i));
      }
    } catch {
      return [];
    }
  }
  return [];
}

export default function OptimizedMenuItem({
  item,
  onSelect,
  priority = false,
  index = 0,
}: OptimizedMenuItemProps) {
  const locale = useLocale();
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Get the appropriate name based on locale with proper fallbacks
  const getDisplayName = () => {
    if (locale === 'ar') {
      // For Arabic: prefer name_arb, then name_en, then name_ckb
      return (item as any).name_arb || item.name_en || item.name_ckb || 'Menu Item';
    } else if (locale === 'ku') {
      // For Kurdish: prefer name_ckb, then English
      return item.name_ckb || item.name_en || 'Menu Item';
    } else {
      // For English: prefer name_en, then Kurdish
      return item.name_en || item.name_ckb || 'Menu Item';
    }
  };

  const getDescription = () => {
    if (locale === 'ar') {
      return (item as any).description_arb || (item as any).description_en || (item as any).description_ckb || '';
    } else if (locale === 'ku') {
      return (item as any).description_ckb || (item as any).description_en || (item as any).description_arb || '';
    } else {
      return (item as any).description_en || (item as any).description_ckb || (item as any).description_arb || '';
    }
  };

  const displayName = getDisplayName();
  const description = getDescription();
  const itemSizes = normalizeSizes((item as any).sizes);
  const itemColors = normalizeColors((item as any).colors);
  
  // Alternate animation direction: even items from left, odd from right
  const isFromLeft = index % 2 === 0;
  const initialX = isFromLeft ? -50 : 50;

  // Split sizes into rows of 2
  const sizeRows = [];
  for (let i = 0; i < itemSizes.length; i += 2) {
    sizeRows.push(itemSizes.slice(i, i + 2));
  }

  const isSoldOut = (item as any).is_sold_out || false;

  const getSoldOutText = () => {
    if (locale === 'ar') return 'نفد';
    if (locale === 'ku') return 'بەردەست نیە';
    return 'Sold Out';
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(item)}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        setTouchStart({ x: touch.clientX, y: touch.clientY });
      }}
      onTouchEnd={(e) => {
        const touch = e.changedTouches[0];
        const deltaX = Math.abs(touch.clientX - touchStart.x);
        const deltaY = Math.abs(touch.clientY - touchStart.y);

        if (deltaX < 10 && deltaY < 10) {
          onSelect(item);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(item);
        }
      }}
      initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
      whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, ease: 'easeOut', delay: (index % 4) * 0.1 }}
      className={`overflow-hidden p-0 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer rounded-lg bg-white flex flex-col h-full active:shadow-md ${
        isSoldOut ? 'opacity-60' : ''
      }`}
    >
      {/* Image with Next.js Image component for optimization */}
      <div className={`relative w-full h-44 md:h-48 overflow-hidden shrink-0 bg-gray-100 transition-opacity duration-300 ${
        imageLoaded ? 'opacity-100' : 'opacity-90'
      }`}>
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="text-white font-bold text-lg md:text-xl bg-red-600 px-4 py-2 rounded-lg shadow-lg">
              {getSoldOutText()}
            </span>
          </div>
        )}
        <Image
          loader={imageKitLoader}
          src={item.image_url}
          alt={displayName}
          width={300}
          height={200}
          sizes={getResponsiveSizes('thumbnail')}
          priority={priority}
          placeholder="blur"
          blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200'%3E%3Crect fill='%23f3f4f6' width='300' height='200'/%3E%3C/svg%3E"
          quality={70}
          loading={priority ? 'eager' : 'lazy'}
          className="w-full h-full object-cover"
          onLoadingComplete={() => setImageLoaded(true)}
          onError={(e) => {
            console.error(`Failed to load image for ${displayName}`);
          }}
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col justify-between flex-1 gap-3">
        <div className="flex flex-col gap-1">
          {/* Name and Colors in Row */}
          <div className="flex items-center gap-2 justify-between">
            <div className={`font-bold text-sm md:text-base line-clamp-2 flex-1 ${isSoldOut ? 'line-through text-gray-500' : ''}`}>
              {displayName}
            </div>
            {/* Color Badges */}
            {itemColors.length > 0 && (
              <div className="flex gap-1.5 flex-shrink-0">
                {itemColors.map((color) => (
                  <div
                    key={color}
                    className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            )}
          </div>
          {description && (
            <div className="text-xs text-gray-500 line-clamp-2">
              {description}
            </div>
          )}
        </div>

        {/* Size Selection (if item has sizes) */}
        {sizeRows.length > 0 && (
          <div className="flex flex-col gap-2">
            {sizeRows.map((row, rowIdx) => (
              <div key={rowIdx} className="flex gap-2">
                {row.map((size: string) => (
                  <div
                    key={size}
                    className="flex-1 px-2 py-1 text-xs font-bold rounded-md bg-gray-100 text-gray-700 text-center"
                  >
                    {size}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
