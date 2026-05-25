import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n/request';

const intlMiddleware = createMiddleware({
  locales: locales as unknown as string[],
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: false, // Always use Kurdish as default, ignore browser language
});

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Apply i18n middleware
  const intlResponse = intlMiddleware(request);
  if (intlResponse) {
    // Extract locale from pathname
    const locale = extractLocale(pathname);
    const basePathname = pathname.replace(`/${locale}`, '') || '/';
    
    // List of public routes that don't require authentication
    const publicRoutes = ['/login', '/api/menu', '/api/auth/login', '/api/auth/logout', '/api/upload'];

    // Check if the current path is public
    const isPublicRoute = publicRoutes.some(route => 
      basePathname === route || basePathname.startsWith(route + '/')
    );

    // Allow public routes
    if (isPublicRoute) {
      return intlResponse;
    }

    // Check if accessing admin/dashboard - requires authentication
    if (basePathname.startsWith('/admin')) {
      const token = request.cookies.get('adminAuth')?.value;
      
      if (!token) {
        // Redirect to login if not authenticated
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
      }
    }
    
    return intlResponse;
  }

  return NextResponse.next();
}

function extractLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  return (locales as unknown as string[]).includes(segments[0]) ? segments[0] : defaultLocale as unknown as string;
}

// Configure which routes should be processed by middleware
export const config = {
  matcher: [
    '/',
    '/(ku|en)/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|image|fonts|public).*)',
  ],
};
