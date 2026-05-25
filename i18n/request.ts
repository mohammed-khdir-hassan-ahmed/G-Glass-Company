import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'ku', 'ar'] as const;
export const defaultLocale = 'ku' as const;

export default getRequestConfig(async ({ locale }) => {
  // Validate locale
  const validLocale = locale && (locales as unknown as string[]).includes(locale) ? locale : defaultLocale;
  
  // Load translation messages
  const messages = (await import(`../messages/${validLocale}.json`)).default;
  return {
    locale: validLocale,
    messages,
  };
});
