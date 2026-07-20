'use client';

import { trackEvent } from '@/lib/analytics';

export default function TrackedCreateLink({
  href,
  eventName = 'bookstube_create_click',
  ctaLocation,
  analytics = {},
  children,
  ...linkProps
}) {
  return (
    <a
      {...linkProps}
      href={href}
      onClick={() => trackEvent(eventName, {
        ...analytics,
        cta_location: ctaLocation,
        destination_url: href,
      })}
    >
      {children}
    </a>
  );
}
