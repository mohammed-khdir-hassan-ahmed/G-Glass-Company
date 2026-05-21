'use client';

import { useState, useTransition, useMemo } from 'react';
import { Search, Home, Gem, Sparkles, Flower2, Palette, Circle, Diamond, CheckCircle2, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import MenuGrid from '@/components/MenuGrid';
import { useLocale } from 'next-intl';
import { type MenuItem } from '@/lib/db';
import { CATEGORIES } from '@/lib/categories';

interface MenuSearchProps {
  items: MenuItem[];
}

// Map icon names to actual Lucide components
const ICON_COMPONENTS: Record<string, any> = {
  'Grid3x3': Home,
  'Gem': Gem,
  'Sparkles': Sparkles,
  'Flower2': Flower2,
  'Palette': Palette,
  'Circle': Circle,
  'Diamond': Diamond,
  'CheckCircle2': CheckCircle2,
  'Zap': Zap,
};

// Build aliases from CATEGORIES config
const CATEGORY_ALIASES: Record<string, string[]> = {};
CATEGORIES.forEach((cat) => {
  CATEGORY_ALIASES[cat.value] = [
    cat.value,
    cat.label_en.toLowerCase(),
    cat.label_ckb.toLowerCase(),
    cat.label_arb.toLowerCase(),
  ];
});

function normalizeCategory(value?: string | null): string {
  if (!value) return 'all';

  const normalized = value.trim().toLowerCase();
  for (const [key, aliases] of Object.entries(CATEGORY_ALIASES)) {
    if (aliases.some((alias) => alias.toLowerCase() === normalized)) {
      return key;
    }
  }

  return value.toLowerCase();
}

export default function MenuSearch({ items }: MenuSearchProps) {
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // useTransition for non-blocking category filtering
  // Shows loading state without blocking user input
  const [isPending, startTransition] = useTransition();
  
  const getDisplayName = (item: MenuItem) => {
    // Show language-specific name with proper fallbacks
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

  // Build categories array with proper labels for current locale
  const categories = CATEGORIES.map((cat) => ({
    id: cat.value,
    name:
      locale === 'ar'
        ? cat.label_arb
        : locale === 'ku'
        ? cat.label_ckb
        : cat.label_en,
    icon: ICON_COMPONENTS[cat.icon] || Home,
  }));

  // Build category map for section headers
  const categoryMap: { [key: string]: string } = {};
  CATEGORIES.forEach((cat) => {
    categoryMap[cat.value] =
      locale === 'ar'
        ? cat.label_arb
        : locale === 'ku'
        ? cat.label_ckb
        : cat.label_en;
  });

  // Memoized filtering to prevent unnecessary re-renders
  const filteredItems = useMemo(() => {
    let result = items.filter(item => {
      const displayName = getDisplayName(item);
      const matchesSearch = displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (item.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                           (item.name_ckb?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                           ((item as any).name_arb?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesCategory = selectedCategory === 'all' || normalizeCategory(item.category) === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    return result;
  }, [items, searchQuery, selectedCategory, locale]);

  // Group items by category when viewing "all"
  const groupedItems: { [key: string]: MenuItem[] } = useMemo(() => {
    const grouped: { [key: string]: MenuItem[] } = {};
    if (selectedCategory === 'all') {
      filteredItems.forEach(item => {
        const cat = normalizeCategory(item.category);
        if (!grouped[cat]) {
          grouped[cat] = [];
        }
        grouped[cat].push(item);
      });
    }
    return grouped;
  }, [filteredItems, selectedCategory]);

  const handleCategoryClick = (categoryId: string) => {
    startTransition(() => {
      setSelectedCategory(categoryId);
    });
  };

  return (
    <>
      {/* Categories and Search Section */}
      <div className="flex flex-col gap-3 items-center mt-6 mb-4 px-1 md:px-0 w-full">
        {/* Categories with loading indicator */}
        <div 
          className="flex gap-1 md:gap-3 overflow-x-auto overflow-y-hidden w-full md:justify-center md:pb-2 pb-2 px-2 md:px-0 scroll-smooth [-webkit-overflow-scrolling:touch]" 
          style={{ 
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <style>{`
            .categories-scroll::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                disabled={isPending}
                className={`flex flex-col items-center gap-0.5 px-2 md:px-3 py-1.5 md:py-2 rounded-none transition-all duration-200 flex-shrink-0 border-b-2 disabled:opacity-60 ${
                  isSelected
                    ? 'bg-transparent border-b-2 border-[#000000] text-[#000000]'
                    : 'bg-transparent hover:border-b-2 hover:border-[#000000] hover:text-[#000000] text-gray-600 border-b-2 border-transparent'
                }`}
                style={{ scrollSnapAlign: 'center' }}
                title={category.name}
              >
                <IconComponent className="w-4 h-4 md:w-5 md:h-5" />
                <span className={`text-[11px] md:text-xs text-center whitespace-nowrap ${
                  isSelected ? 'font-bold' : 'font-medium'
                }`}>{category.name}</span>
              </button>
            );
          })}
        </div>
        
        {/* Search Input */}
        <div className="w-full md:max-w-2xl flex-shrink-0">
          <div className="relative h-full">
            {locale === 'en' ? (
              <>
                <Input 
                  type="text" 
                  placeholder="What would you like to eat?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-6 md:py-5 rounded-lg border border-gray-300 focus:border-[#000000] focus:outline-none focus:ring-2 focus:ring-[#000000]/10 transition-all text-base placeholder:text-sm"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </>
            ) : locale === 'ar' ? (
              <>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input 
                  type="text" 
                  placeholder="ماذا تريد أن تأكل؟"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-6 md:py-5 rounded-lg border border-gray-300 focus:border-[#000000] focus:outline-none focus:ring-2 focus:ring-[#000000]/10 transition-all text-base placeholder:text-sm"
                />
              </>
            ) : (
              <>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input 
                  type="text" 
                  placeholder=" بەدوای چی دەگەڕێیت؟"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-6 md:py-5 rounded-lg border border-gray-300 focus:border-[#000000] focus:outline-none focus:ring-2 focus:ring-[#000000]/10 transition-all text-base placeholder:text-sm"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Loading indicator for category transitions */}
      {isPending && (
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>{locale === 'en' ? 'Filtering...' : 'جاری کردندە...'}</p>
        </div>
      )}

      {/* Menu Grid */}
      <div className="mt-6">
        {selectedCategory === 'all' && Object.keys(groupedItems).length > 0 ? (
          <div className="flex flex-col gap-10">
            {Object.entries(groupedItems).map(([categoryId, categoryItems]) => (
              <div key={categoryId}>
                <div className="mb-6 md:mb-8">
                  {/* Mobile: Stacked layout */}
                  <div className="md:hidden flex items-center justify-center gap-3">
                    <div className="flex-1 h-0.5 bg-[#000000]"></div>
                    <h2 className="text-base font-bold text-[#000000] text-center whitespace-nowrap px-2">
                      {categoryMap[categoryId] || categoryId}
                    </h2>
                    <div className="flex-1 h-0.5 bg-[#000000]"></div>
                  </div>
                  
                  {/* Desktop: Line design */}
                  <div className="hidden md:flex items-center justify-center gap-4">
                    <div className="flex-1 h-px bg-[#000000]"></div>
                    <h2 className="text-lg font-bold text-[#000000] px-4 whitespace-nowrap">
                      {categoryMap[categoryId] || categoryId}
                    </h2>
                    <div className="flex-1 h-px bg-[#000000]"></div>
                  </div>
                </div>
                <MenuGrid items={categoryItems} />
              </div>
            ))}
          </div>
        ) : selectedCategory !== 'all' && filteredItems.length > 0 ? (
          <MenuGrid items={filteredItems} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>{locale === 'en' ? 'No items found' : 'هیچ کاڵایەک نیە ! '}</p>
          </div>
        )}
      </div>
    </>
  );
}

