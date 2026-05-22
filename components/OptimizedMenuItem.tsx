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
  const [isFavorite, setIsFavorite] = useState(false);
  
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

  const isRTL = locale === 'ku' || locale === 'ar';

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
      initial={{ opacity: 0, x: isFromLeft ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: (index % 4) * 0.1 }}
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`relative overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer rounded-2xl bg-white flex lg:flex-col items-center lg:items-stretch w-full lg:w-auto h-40 md:h-44 lg:h-full active:shadow-md ${
        isSoldOut ? 'opacity-60' : ''
      }`}
    >
      {/* Favorite Button - Top Right Mobile */}
      <motion.button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsFavorite(!isFavorite);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsFavorite(!isFavorite);
        }}
        animate={isFavorite ? { scale: [1, 1.3, 1], rotate: [0, 360] } : {}}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="absolute lg:hidden top-2 z-20 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 pointer-events-auto"
        style={{
          [isRTL ? 'left' : 'right']: '0.5rem'
        }}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg
          className={`w-5 h-5 md:w-6 md:h-6 ${isFavorite ? 'fill-red-500' : 'fill-none text-gray-400'}`}
          stroke={isFavorite ? 'none' : 'currentColor'}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={isFavorite ? 0 : 2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </motion.button>

      {/* Image Section - RTL: Right Side, LTR: Left Side */}
      <div className={`relative w-1/2 lg:w-full h-full lg:h-48 overflow-hidden shrink-0 bg-gradient-to-br from-gray-100 to-gray-50 transition-opacity duration-300 ${isRTL ? 'order-2 lg:order-1' : 'order-1'} ${
        imageLoaded ? 'opacity-100' : 'opacity-90'
      }`}>
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="text-white font-bold text-sm md:text-base bg-red-600 px-3 py-1.5 rounded-lg shadow-lg">
              {getSoldOutText()}
            </span>
          </div>
        )}
        <Image
          loader={imageKitLoader}
          src={item.image_url}
          alt={displayName}
          width={200}
          height={200}
          sizes={getResponsiveSizes('thumbnail')}
          priority={priority}
          placeholder="blur"
          blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23f3f4f6' width='200' height='200'/%3E%3C/svg%3E"
          quality={75}
          loading={priority ? 'eager' : 'lazy'}
          className={`w-full h-full object-cover ${isSoldOut ? 'grayscale' : ''}`}
          onLoadingComplete={() => setImageLoaded(true)}
          onError={(e) => {
            console.error(`Failed to load image for ${displayName}`);
          }}
        />
      </div>

      {/* Content Section - RTL: Left Side, LTR: Right Side */}
      <div className={`w-1/2 lg:w-full px-4 md:px-6 lg:px-4 py-3 md:py-4 lg:py-3 flex flex-col justify-center items-center h-full gap-2.5 ${isRTL ? 'order-1 lg:order-2' : 'order-2'}`}>
        {/* Title */}
        <h3 className={`font-extrabold text-sm md:text-base lg:text-base line-clamp-2 leading-tight ${isRTL ? 'text-right lg:text-center' : 'text-center'} ${isSoldOut ? 'line-through text-gray-400' : 'text-gray-900'}`}>
          {displayName}
        </h3>

        {/* Colors and Sizes - Compact with Icons */}
        <div className="flex flex-col gap-2 lg:gap-1.5 items-center w-full">
          {/* Colors */}
          {itemColors.length > 0 && (
            <div className="flex items-center gap-2 justify-center">
              <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {itemColors.map((color) => (
                  <div
                    key={color}
                    className="w-5 h-5 md:w-6 md:h-6 lg:w-5 lg:h-5 rounded-full border-2 border-gray-200 shadow-md flex-shrink-0 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {itemSizes.length > 0 && (
            <div className={`flex items-center gap-2 justify-center flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex gap-2 flex-wrap justify-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                {itemSizes.slice(0, 2).map((size: string) => (
                  <div
                    key={size}
                    className="px-2.5 py-1 lg:px-2 lg:py-0.5 text-xs lg:text-xs font-bold rounded-md bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border border-gray-200 shadow-sm hover:from-gray-100 hover:to-gray-150 transition-all"
                  >
                    {size}
                  </div>
                ))}
                {itemSizes.length > 2 && (
                  <div className="px-2.5 py-1 lg:px-2 lg:py-0.5 text-xs lg:text-xs font-bold rounded-md bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 border border-blue-200 shadow-sm hover:from-blue-100 hover:to-blue-150 transition-all">
                    +{itemSizes.length - 2}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
