'use client';

import { usePathname } from 'next/navigation';

// Header search form. Client component only so it can read the current path and
// scope the query to the library being viewed (/[lang]/taglib/[slug] → hidden lib
// field); it still submits as a plain GET to /[lang]/search.
export default function HeaderSearch({ lang, placeholder }) {
  const pathname = usePathname() || '';
  const m = pathname.match(/^\/[^/]+\/taglib\/([^/?]+)/);
  const lib = m ? decodeURIComponent(m[1]) : '';

  return (
    <form action={`/${lang}/search`} className="header-search" role="search">
      {lib ? <input type="hidden" name="lib" value={lib} /> : null}
      <input
        type="search"
        name="q"
        className="header-search-input"
        placeholder={placeholder}
        required
        minLength={2}
      />
      <button type="submit" className="header-search-btn" aria-label={placeholder}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z" />
        </svg>
      </button>
    </form>
  );
}
