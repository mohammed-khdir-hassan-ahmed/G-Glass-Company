'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useTransition, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Languages } from 'lucide-react';

const KNOWN_LOCALES = new Set(['en', 'ku', 'ar']);

function getBasePath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);

  while (segments.length > 0 && KNOWN_LOCALES.has(segments[0])) {
    segments.shift();
  }

  return segments.length ? `/${segments.join('/')}` : '/';
}

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const isHomePage = getBasePath(pathname) === '/';
    if (isHomePage) {
      const hasSelected = localStorage.getItem('g_glass_lang_selected');
      if (!hasSelected) {
        setOpen(true);
      }
    }
  }, [pathname]);

  const handleLanguageChange = (newLocale: string) => {
    localStorage.setItem('g_glass_lang_selected', 'true');
    if (newLocale === locale) {
      setOpen(false);
      return;
    }

    startTransition(() => {
      const basePath = getBasePath(pathname);
      router.replace(basePath, { locale: newLocale });
    });
  };

  const LANGUAGES = [
    { code: 'ku', label: 'کوردی' },
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
  ];

  const translations = {
    ku: {
      title: "زمانەکەت هەڵبژێرە",
      description: "بە کامە زمان دەتەوێت سەیری ئەم وێبسایتە بکەیت؟",
    },
    en: {
      title: "Select Your Language",
      description: "Which language do you want to view this website in?",
    },
    ar: {
      title: "اختر لغتك",
      description: "بأي لغة تريد تصفح هذا الموقع؟",
    },
  };

  const currentTranslations = translations[locale as 'ku' | 'en' | 'ar'] || translations.ku;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-9 h-9 cursor-pointer  aspect-square bg-[#000000] text-white rounded-md flex flex-col items-center justify-center text-base font-bold shadow hover:bg-[#1a1a1a] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#000000]/55"
        aria-label="Change language"
      >
        <Languages size={18} className="mb-0.5" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xs w-full p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#000000] text-center">
              {currentTranslations.title}
            </DialogTitle>
            <DialogDescription className="text-center mb-4">
              {currentTranslations.description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 items-center">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                disabled={isPending || locale === lang.code}
                className={`w-24 h-8 rounded-xl font-bold border-2 text-base flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#000000]/55
                  ${locale === lang.code
                    ? 'bg-[#000000] text-white border-[#000000] shadow'
                    : 'bg-white text-[#000000] border-[#000000] hover:bg-[#000000]/90 hover:text-white'}
                `}
                aria-current={locale === lang.code ? 'true' : undefined}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

