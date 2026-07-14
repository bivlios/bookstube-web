'use client';

import { useEffect } from 'react';

// Fire-and-forget view counter for the book detail page. Client-side so ISR page
// caching doesn't swallow it. Renders nothing. sessionStorage guards one count per
// book per tab session (also absorbs React strict-mode double mounts in dev).
export default function ViewPing({ url, bookId }) {
  useEffect(() => {
    const key = `bt-viewed:${bookId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch (e) { /* private mode — count anyway */ }
    fetch(url, { method: 'POST', keepalive: true }).catch(() => {});
  }, [url, bookId]);

  return null;
}
