'use client';

import { useEffect } from 'react';

// Keeps --header-h in sync with the real header height, since it varies by viewport
// width and locale (the header CTA text wraps differently per language). The library
// switcher uses this variable to stick right below the header instead of a guessed offset.
export default function HeaderHeightSync() {
  useEffect(() => {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const set = () => {
      document.documentElement.style.setProperty('--header-h', `${header.getBoundingClientRect().height}px`);
    };
    set();
    const ro = new ResizeObserver(set);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  return null;
}
