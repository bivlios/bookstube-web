'use client';

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics';

export default function BookOpenTracker({ analytics }) {
  const trackedRef = useRef(false);
  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    trackEvent('bookstube_book_open', analytics);
  }, [analytics]);

  return null;
}
