import { NextResponse } from 'next/server';

const LOCALES = ['he', 'en', 'ar', 'de'];
const DEFAULT_LOCALE = 'he';

// Redirect locale-less paths to a locale-prefixed one (/ → /he, /books/x → /he/books/x).
// Language is picked from Accept-Language, falling back to Hebrew.
export function middleware(req) {
  const { pathname } = req.nextUrl;

  // API routes are locale-agnostic (used by the client paginator) — never prefix them.
  if (pathname.startsWith('/api/')) return;

  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (hasLocale) return;

  const accept = (req.headers.get('accept-language') || '').toLowerCase();
  const preferred = accept
    .split(',')
    .map((p) => p.split(';')[0].trim().slice(0, 2));
  const locale = preferred.find((p) => LOCALES.includes(p)) || DEFAULT_LOCALE;

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

// Skip Next internals, the sitemap/robots, and anything with a file extension.
export const config = {
  matcher: ['/((?!api|_next|sitemap.xml|robots.txt|.*\\..*).*)'],
};
