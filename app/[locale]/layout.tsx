import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import type { Metadata } from "next";
import "@/app/globals.css";
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/request';
import LocaleSetup from './LocaleSetup';
import { CartProvider } from '@/components/CartContext';

export const metadata: Metadata = {
  title: "G-Glass",
  description: "Global Glass Company - Premium Glass Products & Solutions",
};

export function generateStaticParams() {
  return (locales as unknown as string[]).map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  if (!(locales as unknown as string[]).includes(locale)) {
    notFound();
  }

  const dir = (locale === 'ku' || locale === 'ar') ? 'rtl' : 'ltr';

  const messages = await getMessages({ locale });

  return (
    <LocaleSetup locale={locale}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <CartProvider>
          <div dir={dir} className="min-h-screen w-full max-w-full overflow-x-hidden">
            {children}
          </div>
        </CartProvider>
      </NextIntlClientProvider>
    </LocaleSetup>
  );
}
