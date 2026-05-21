import { Suspense } from 'react';
// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';
import { getAllMenuItems, type MenuItem } from '@/lib/db';
import MenuSearch from '@/components/MenuSearch';
import ImageKitWrapper from '@/components/ImageKitWrapper';
import Celebration from '@/components/Celebration';
import ScrollButtons from '@/components/ScrollButtons';
import Navbar from '@/components/Navbar';
import Loading from './loading';
import { CATEGORIES } from '@/lib/categories';
import { Home as HomeIcon, Gem, Sparkles, Flower2, Palette, Circle, Diamond, CheckCircle2, Zap } from 'lucide-react';
import { useLocale } from 'next-intl';

// Map icon names to actual Lucide components
const ICON_COMPONENTS: Record<string, any> = {
  'Grid3x3': HomeIcon,
  'Gem': Gem,
  'Sparkles': Sparkles,
  'Flower2': Flower2,
  'Palette': Palette,
  'Circle': Circle,
  'Diamond': Diamond,
  'CheckCircle2': CheckCircle2,
  'Zap': Zap,
};

function EmptyStateWithCategories({ locale }: { locale: string }) {
  const categories = CATEGORIES.map((cat) => ({
    id: cat.value,
    name:
      locale?.trim() === 'ar'
        ? cat.label_arb
        : locale?.trim() === 'ku'
        ? cat.label_ckb
        : cat.label_en,
    icon: ICON_COMPONENTS[cat.icon] || HomeIcon,
  }));

  return (
    <div className="mt-3">
      <h1 className="text-xl md:text-4xl font-bold text-[#000000] text-center mt-6 md:mt-0">
        {locale?.trim() === 'en' ? 'Global Glass world ' : locale?.trim() === 'ar' ? 'عالم الزجاج العالمي' : '  کۆمپانیای جیهانی شوشە  '}
      </h1>
      
      {/* Categories Section */}
      <div className="flex flex-col gap-3 items-center mt-6 mb-4 px-1 md:px-0 w-full">
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
            return (
              <div
                key={category.id}
                className={`flex flex-col items-center gap-0.5 px-2 md:px-3 py-1.5 md:py-2 rounded-none transition-all duration-200 flex-shrink-0 border-b-2 border-transparent text-gray-600`}
                style={{ scrollSnapAlign: 'center' }}
                title={category.name}
              >
                <IconComponent className="w-4 h-4 md:w-5 md:h-5" />
                <span className={`text-[11px] md:text-xs text-center whitespace-nowrap font-medium`}>{category.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State Message */}
      <div className="text-center py-8 text-gray-500">
        <p>{locale?.trim() === 'en' ? 'No menu items available' : locale?.trim() === 'ar' ? 'لا توجد عناصر متاحة' : 'هیچ کاڵایەک بەردەست نییە'}</p>
      </div>
    </div>
  );
}


async function MenuList({ locale }: { locale: string }) {
  try {
    const items: MenuItem[] = await getAllMenuItems();

    if (!items.length) {
      return <EmptyStateWithCategories locale={locale} />;
    }

    return (
      <div className="mt-3">
        <h1 className="text-xl md:text-4xl font-bold text-[#000000] text-center mt-6 md:mt-0">
          {locale?.trim() === 'en' ? 'Global Glass world ' : locale?.trim() === 'ar' ? 'عالم الزجاج العالمي' : '  کۆمپانیای جیهانی شوشە  '}
        </h1>
        <MenuSearch items={items} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching menu:', error);
    return (
      <div className="text-center py-8 text-red-500">
        <p>{locale?.trim() === 'en' ? 'Error loading menu items' : locale?.trim() === 'ar' ? 'خطأ في تحميل العناصر' : 'خرابی لە بارکردنی کاڵاکان'}</p>
      </div>
    );
  }
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <ImageKitWrapper>
        <div className="flex-1 px-4 md:px-12 mb-8">
          <div className="mx-auto max-w-6xl">
            <Suspense fallback={<Loading />}>
              <MenuList locale={locale} />
            </Suspense>
          </div>
        </div>
      </ImageKitWrapper>
      <ScrollButtons />
      <Celebration />
      <footer className="py-4 md:py-6 text-gray-600 text-xs md:text-sm px-2 md:px-4" dir="ltr">
        <div className="flex flex-wrap items-center justify-center gap-1 md:gap-2">
          <span className='font-bold'>Designed and developed by</span>
          <a  href="https://www.facebook.com/share/1HwugSQwyQ/" className="inline-flex items-center gap-1 font-bold" >  
            <span className="text-[#000000] underline">Hama sha</span>
          </a>
        </div>
      </footer>
    </div>
  );
}


