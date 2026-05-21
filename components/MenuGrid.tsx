'use client';

import { useState } from 'react';
import Image from 'next/image';
import { imageKitLoader, getResponsiveSizes } from '@/lib/imagekit-loader';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import OptimizedMenuItem from './OptimizedMenuItem';
import { useLocale } from 'next-intl';
import { type MenuItem } from '@/lib/db';

interface MenuGridProps {
  items: MenuItem[];
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
    return value.filter(color => typeof color === 'string' && color.trim() !== '');
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter(color => typeof color === 'string' && color.trim() !== '');
      }
    } catch {
      return [];
    }
  }
  return [];
}

export default function MenuGrid({ items }: MenuGridProps) {
  const locale = useLocale();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  
  const getDisplayName = (item: MenuItem) => {
    if (locale === 'ar') {
      return (item as any).name_arb || item.name_en || item.name_ckb || 'Menu Item';
    } else if (locale === 'ku') {
      return item.name_ckb || item.name_en || 'Menu Item';
    } else {
      return item.name_en || item.name_ckb || 'Menu Item';
    }
  };

  const getDescription = (item: MenuItem) => {
    if (locale === 'ar') {
      return (item as any).description_arb || (item as any).description_en || (item as any).description_ckb || '';
    } else if (locale === 'ku') {
      return (item as any).description_ckb || (item as any).description_en || (item as any).description_arb || '';
    } else {
      return (item as any).description_en || (item as any).description_ckb || (item as any).description_arb || '';
    }
  };

  const itemSizes = selectedItem ? normalizeSizes((selectedItem as any).sizes) : [];
  const itemColors = selectedItem ? normalizeColors((selectedItem as any).colors) : [];
  const sizeRows = itemSizes.map(size => [size]); // Each size in its own row

  const isSoldOut = selectedItem ? ((selectedItem as any).is_sold_out || false) : false;

  const closeItemDialog = () => {
    setSelectedItem(null);
    setSelectedSize(null);
  };

  const getSoldOutText = () => {
    if (locale === 'ar') return 'نفد';
    if (locale === 'ku') return 'لەێستادا بەردەست نیە';
    return 'Sold Out';
  };

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {items.map((item, index) => (
          <OptimizedMenuItem
            key={item.id}
            item={item}
            onSelect={setSelectedItem}
            priority={index < 4}
            index={index}
          />
        ))}
      </div>

      {selectedItem && (
        <Dialog
          open={true}
          onOpenChange={closeItemDialog}
        >
          <DialogContent
            className="w-[calc(100%-1rem)] max-w-[95vw] overflow-hidden rounded-3xl border-0 bg-white p-0 shadow-2xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl"
            dir="ltr"
            showCloseButton={false}
          >
            <DialogTitle className="sr-only">
              {getDisplayName(selectedItem)}
            </DialogTitle>

            <div className="grid max-h-[90vh] overflow-hidden md:h-auto md:grid-cols-2 gap-0">
            <div className="relative overflow-hidden bg-white flex items-center justify-center p-6 sm:p-8 md:p-8">
              {isSoldOut && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                  <span className="text-white font-extrabold text-xl md:text-2xl lg:text-3xl bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 rounded-lg shadow-2xl">
                    {getSoldOutText()}
                  </span>
                </div>
              )}
              <Image
                loader={imageKitLoader}
                src={selectedItem.image_url}
                alt={getDisplayName(selectedItem)}
                width={500}
                height={450}
                sizes={getResponsiveSizes('detail')}
                priority
                placeholder="blur"
                blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 450'%3E%3Crect fill='%23ffffff' width='500' height='450'/%3E%3C/svg%3E"
                quality={90}
                className={`h-auto w-full max-w-full object-contain ${isSoldOut ? 'grayscale opacity-90' : ''}`}
              />
            </div>

            <div className="flex min-h-0 flex-col md:min-h-auto">
            <div className="flex-1 px-5 py-5 sm:px-7 sm:py-6 md:px-8 md:py-8 md:min-h-0 md:overflow-y-auto">
            <div className="mb-5">
              <h2 className={`text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-3xl leading-tight ${locale === 'ar' ? 'text-right' : ''} ${isSoldOut ? 'line-through text-gray-400' : ''}`}>
                {getDisplayName(selectedItem)}
              </h2>
              {isSoldOut && (
                <p className="text-red-600 font-semibold text-sm mt-2">
                  {getSoldOutText()}
                </p>
              )}
            </div>

            {getDescription(selectedItem) && (
              <div className="mb-6 text-sm leading-6 text-gray-600 sm:text-base">
                {getDescription(selectedItem)}
              </div>
            )}

            {/* Size Selection in Modal */}
            {itemSizes.length > 0 && (
              <div className="rounded-xl bg-gray-50 p-4 sm:p-5 border border-gray-100 mb-4">
                <label className="mb-3 block text-sm font-semibold text-gray-700 sm:text-base">
                  سایز
                </label>
                <div className="flex flex-col gap-3">
                  {sizeRows.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex gap-2">
                      {row.map((size: string) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                          className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                            selectedSize === size
                              ? 'bg-gray-900 text-white shadow-md'
                              : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Colors Display */}
            {itemColors.length > 0 && (
              <div className="rounded-xl bg-gray-50 p-4 sm:p-5 border border-gray-100">
                <label className="mb-3 block text-sm font-semibold text-gray-700 sm:text-base">
                  رەنگەکان
                </label>
                <div className="flex flex-wrap gap-3">
                  {itemColors.map((color) => (
                    <div
                      key={color}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className={`w-10 h-10 rounded-full border-2 shadow-md ${
                          color === '#FFFFFF' ? 'border-4 border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                      <span className="text-xs text-gray-600 text-center font-medium">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>

            <div className="border-t border-gray-200 bg-white px-5 py-4 sm:px-7 sm:py-5 md:px-8 md:py-5">
            <Button 
              onClick={closeItemDialog}
              className="h-11 w-full bg-gray-900 text-sm font-semibold text-white hover:bg-gray-950 shadow-md hover:shadow-lg transition-all duration-200 sm:h-12 sm:text-base rounded-lg"
            >
              {locale === 'en' ? 'Close' : 'داخستن'}
            </Button>
            </div>
            </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
