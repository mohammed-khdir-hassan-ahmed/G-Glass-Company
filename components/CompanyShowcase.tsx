'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import { useLocale } from 'next-intl';

interface CompanyShowcaseProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CompanyShowcase({ isOpen, onClose }: CompanyShowcaseProps) {
  const locale = useLocale();

  if (!isOpen) return null;

  const descriptions = {
    en: {
      title: 'About Global Glass Company',
      description: 'We are a leading provider of premium glass products and solutions. With our modern facilities and experienced team, we deliver excellence in every project. Our commitment to quality and innovation has made us a trusted partner for businesses across the region.',
      cta: 'Close',
    },
    ar: {
      title: 'حول شركة الزجاج العالمية',
      description: 'نحن مزود رائد لمنتجات وحلول الزجاج الممتازة. بفضل منشآتنا الحديثة وفريقنا الخبير، نقدم التميز في كل مشروع. لقد جعلنا التزامنا بالجودة والابتكار شريكًا موثوقًا للشركات في جميع أنحاء المنطقة.',
      cta: 'إغلاق',
    },
    ku: {
      title: 'دەربارەی کۆمپانیای جیهانی شوشە',
      description: ' ئێمە پێشەنگین لە دابینکردنی بەرهەم و چارەسەرییە پێشکەوتووەکان بە شێوازێکی بەرپرسیارانە. بەهۆی بەکارهێنانی تەکنەلۆژیای مۆدێرن و لێهاتوویی تیمی پسپۆڕمان، هەمیشە باشترینەکان لە هەر پڕۆژەیەکدا پێشکەش دەکەین. پابەندبوونمان بە کوالیتی بەرز و داهێنان، ئێمەی کردووە بە هاوبەشێکی جێگەی متمانە بۆ سەرجەم کۆمپانیا و کارەکان لە تەواوی ناوچەکەدا',
      cta: 'داخستن',
    },
  };

  const content = descriptions[locale as keyof typeof descriptions] || descriptions.en;

  return (
    <>
      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-transparent flex items-center justify-center " onClick={onClose}>
          {/* Modal Content */}
          <div
            className="relative bg-white rounded-xl shadow-2xl max-w-sm md:max-w-2xl w-full max-h-[85vh] md:max-h-[90vh] overflow-y-auto scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
            <style>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>
            {/* Close Button */}
          

            {/* Content */}
            <div className="p-3 md:p-8">
              {/* Title */}
              <h2 className="text-lg md:text-3xl font-bold text-[#000000] mb-3 md:mb-6 text-center">
                {content.title}
              </h2>

              {/* Images Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 mb-3 md:mb-6">
                {/* Building 1 */}
                <div className="relative h-32 md:h-56 rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src="/image/building1.webp"
                    alt="Building 1"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                {/* Building 2 */}
                <div className="relative h-32 md:h-56 rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src="/image/building2.webp"
                    alt="Building 2"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 text-xs md:text-base leading-relaxed mb-3 md:mb-6 text-justify">
                {content.description}
              </p>

              {/* Highlights */}
              <div className="grid grid-cols-3 gap-2 md:gap-3 mb-3 md:mb-6">
                <div className="bg-blue-50 p-2 md:p-3 rounded-lg text-center">
                  <p className="text-lg md:text-2xl font-bold text-[#000000]">100%</p>
                  <p className="text-[10px] md:text-sm text-gray-600">
                    {locale === 'ar' ? 'ضمانت' : locale === 'ku' ? 'گەرەنتی' : 'Guarantee'}
                  </p>
                </div>
                <div className="bg-green-50 p-2 md:p-3 rounded-lg text-center">
                  <p className="text-lg md:text-2xl font-bold text-[#000000]">12+</p>
                  <p className="text-[10px] md:text-sm text-gray-600">
                    {locale === 'ar' ? 'سنة' : locale === 'ku' ? 'ساڵ ئەزموون' : 'Years'}
                  </p>
                </div>
                <div className="bg-purple-50 p-2 md:p-3 rounded-lg text-center">
                  <p className="text-lg md:text-2xl font-bold text-[#000000]">100%</p>
                  <p className="text-[10px] md:text-sm text-gray-600">
                    {locale === 'ar' ? 'حد ثقه' : locale === 'ku' ? 'متمانە' : 'Trust'}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-center mt-2 md:mt-0">
                <button
                  onClick={onClose}
                  className="bg-[#000000] hover:bg-gray-800 text-white font-semibold py-1.5 md:py-2 px-6 md:px-8 rounded-lg transition text-sm md:text-base"
                >
                  {content.cta}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
