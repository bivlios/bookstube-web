'use client';

import { useRouter } from 'next/navigation';

// "Back to library" — returns to whichever library/collection the reader came from
// (home, a taglib, a filtered view) so their last selection is preserved, instead of
// always hard-linking to the home library.
//
// We drive this off the browser history: if the user reached this book page from within
// the site (same-origin referrer), `router.back()` lands them exactly where they were,
// including the paginated ?skip= state (AnimatedLibrary reflects it into the URL). For
// direct entries (search, shared link, new tab — no same-origin referrer) there's no
// in-app history to go back to, so we fall back to the home library. The visible href
// stays the home URL, so it degrades gracefully without JS and stays crawlable.
export default function BackButton({ lang, label }) {
  const router = useRouter();
  const home = `/${lang}`;

  const onClick = (e) => {
    if (typeof window === 'undefined') return;
    let sameOrigin = false;
    try {
      sameOrigin =
        !!document.referrer && new URL(document.referrer).origin === window.location.origin;
    } catch {
      sameOrigin = false;
    }
    if (sameOrigin && window.history.length > 1) {
      e.preventDefault();
      router.back();
    }
    // else: let the plain <a href> navigate to the home library.
  };

  return (
    <a href={home} className="back back-btn" onClick={onClick}>
      <span className="back-arrow" aria-hidden="true">←</span>
      {label}
    </a>
  );
}
