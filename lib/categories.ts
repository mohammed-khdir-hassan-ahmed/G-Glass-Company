/**
 * Categories configuration with Kurdish names and Lucide icons
 * Used for menu categorization in the dashboard and frontend
 */

export interface Category {
  id: string;
  value: string;
  label_en: string;
  label_ckb: string;
  label_arb: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
}

export const CATEGORIES: Category[] = [
  {
    id: 'all',
    value: 'all',
    label_en: 'All',
    label_ckb: 'هەموو',
    label_arb: 'الكل',
    icon: 'Grid3x3',
    color: 'bg-gray-500',
  },
  {
    id: 'double-glass',
    value: 'double-glass',
    label_en: 'Double-sided Glass',
    label_ckb: 'مەوادی دەبڵ جام',
    label_arb: 'الزجاج الثنائي الجانب',
    icon: 'Gem',
    color: 'bg-blue-500',
  },
  {
    id: 'decorations',
    value: 'decorations',
    label_en: 'Decorations',
    label_ckb: 'دیکۆرەکان',
    label_arb: 'الديكورات',
    icon: 'Sparkles',
    color: 'bg-purple-500',
  },
  {
    id: 'flowers',
    value: 'flowers',
    label_en: 'Flowers',
    label_ckb: 'گوڵەکان',
    label_arb: 'الأزهار',
    icon: 'Flower2',
    color: 'bg-pink-500',
  },
  {
    id: 'silicone-clay',
    value: 'silicone-clay',
    label_en: 'Silicone & Clay',
    label_ckb: 'سلیکۆن و مەحجون',
    label_arb: 'السيليكون والطين',
    icon: 'Palette',
    color: 'bg-orange-500',
  },
  {
    id: 'rubber',
    value: 'rubber',
    label_en: 'Rubber',
    label_ckb: 'لاستیک',
    label_arb: 'المطاط',
    icon: 'Circle',
    color: 'bg-green-500',
  },
  {
    id: 'diamond-glass',
    value: 'diamond-glass',
    label_en: 'Diamonds & Glass Cut',
    label_ckb: 'ئەڵماس و شوشەبڕ',
    label_arb: 'الماس وقطع الزجاج',
    icon: 'Diamond',
    color: 'bg-cyan-500',
  },
  {
    id: 'requirements',
    value: 'requirements',
    label_en: 'Requirements',
    label_ckb: 'پێداویستەکان',
    label_arb: 'المتطلبات',
    icon: 'CheckCircle2',
    color: 'bg-red-500',
  },
  {
    id: 'tools',
    value: 'tools',
    label_en: 'Devices',
    label_ckb: 'ئامێرەکان',
    label_arb: 'جهاز',
    icon: 'Zap',
    color: 'bg-yellow-500',
  },
];

/**
 * Get a category by its value
 */
export function getCategoryByValue(value: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.value === value);
}

/**
 * Get category label in specified language
 */
export function getCategoryLabel(
  value: string,
  language: 'en' | 'ckb' | 'arb' = 'en'
): string {
  const category = getCategoryByValue(value);
  if (!category) return value;

  switch (language) {
    case 'ckb':
      return category.label_ckb;
    case 'arb':
      return category.label_arb;
    case 'en':
    default:
      return category.label_en;
  }
}

/**
 * Get all category values (for database queries)
 */
export function getCategoryValues(): string[] {
  return CATEGORIES.map((cat) => cat.value);
}
