'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { libBySlug, libHref } from '@/lib/libraries';

// Header search form. Client component only so it can read the current path and
// scope the query to the library being viewed (/[lang]/taglib/[slug] → hidden lib
// field); it still submits as a plain GET to /[lang]/search.
export default function HeaderSearch({ lang, placeholder, closeLabel }) {
  const pathname = usePathname() || '';
  const m = pathname.match(/^\/[^/]+\/taglib\/([^/?]+)/);
  const lib = m ? decodeURIComponent(m[1]) : '';
  const isSearchPage = /^\/[^/]+\/search$/.test(pathname);

  // On the results page itself there's no taglib segment to read the scope from —
  // it travels as ?lib= instead (set by the hidden field below when a search was
  // launched from within a taglib). The close button clears the query and returns
  // there (or home, if the search wasn't scoped to a library). Read via useEffect
  // (not useSearchParams) so this component doesn't force a Suspense boundary on
  // every page that renders the header.
  const [query, setQuery] = useState({ q: '', lib: '' });
  useEffect(() => {
    if (!isSearchPage) return;
    const params = new URLSearchParams(window.location.search);
    setQuery({ q: params.get('q') || '', lib: params.get('lib') || '' });
  }, [isSearchPage, pathname]);

  const q = isSearchPage ? query.q : '';
  const closeHref = isSearchPage ? libHref(libBySlug(query.lib) || { home: true }, lang) : '';

  return (
    <form action={`/${lang}/search`} className="header-search" role="search">
      {lib ? <input type="hidden" name="lib" value={lib} /> : null}
      <input
        key={q}
        type="search"
        name="q"
        className="header-search-input"
        placeholder={placeholder}
        defaultValue={q}
        required
        minLength={2}
      />
      {isSearchPage ? (
        <a href={closeHref} className="header-search-btn" aria-label={closeLabel}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z" />
          </svg>
        </a>
      ) : (
        <button type="submit" className="header-search-btn" aria-label={placeholder}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z" />
          </svg>
        </button>
      )}
    </form>
  );
}
