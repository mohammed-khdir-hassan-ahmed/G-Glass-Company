'use client';

import { useEffect } from 'react';

export default function LocaleSetup({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    const isKurdish = locale === 'ku';
    const dir = isKurdish ? 'rtl' : 'ltr';
    
    htmlElement.setAttribute('lang', locale);
    htmlElement.setAttribute('dir', dir);

    if (bodyElement) {
      bodyElement.setAttribute('dir', dir);
      bodyElement.classList.toggle('rtl', isKurdish);
      bodyElement.classList.toggle('ltr', !isKurdish);
    }
  }, [locale]);

  return <>{children}</>;
}
