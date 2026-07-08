'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { GA_ID } from './Analytics';

// Sends a GA4 page_view on first load and on every client-side navigation
// (pathname or query change). Must be rendered inside a <Suspense> boundary
// because useSearchParams would otherwise opt the whole tree into dynamic rendering.
export default function GARouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID || typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    const query = searchParams?.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}
