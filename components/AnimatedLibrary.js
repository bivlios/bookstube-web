'use client';

import { useMemo, useRef, useState } from 'react';
import { makeT, isRTL } from '@/lib/i18n';
import BookCard from './BookCard';

// The book grid + prev/next arrows, with an animated slide between pages. The arrows are
// real crawlable <a href> paginated links (so SEO + no-JS still work), but clicks are
// intercepted: we fetch the next page from /api/library and cross-slide the old grid out
// while the new one slides in — forward slides toward the start of the reading direction
// (left in LTR, right in RTL), backward the other way.
//
// `prioritizeLang` mirrors the home page's behaviour of surfacing books whose original
// language matches the UI language first, applied to every fetched page so paging stays
// consistent with the initial server render.
export default function AnimatedLibrary({
  lang, lib, topic, bookLang, prioritizeLang,
  initialBooks, total, limit, initialSkip = 0, basePath,
}) {
  const t = useMemo(() => makeT(lang), [lang]);
  const rtl = isRTL(lang);

  const [books, setBooks] = useState(initialBooks || []);
  const [skip, setSkip] = useState(initialSkip);
  const [outgoing, setOutgoing] = useState(null); // { books, dir } during a transition
  const [busy, setBusy] = useState(false);
  const rootRef = useRef(null);

  const pages = Math.max(1, Math.ceil(total / limit));
  const page = Math.floor(skip / limit) + 1;
  const hasPrev = skip > 0;
  const hasNext = skip + limit < total;

  // Server URL for a given skip (also the crawlable href on each arrow).
  const mk = (s) => {
    const p = new URLSearchParams();
    if (topic) p.set('topic', topic);
    if (bookLang) p.set('bookLang', bookLang);
    if (s) p.set('skip', String(s));
    const q = p.toString();
    return q ? `${basePath}?${q}` : basePath;
  };

  // Same language-priority shaping the home page applies to the raw API page.
  const shape = (raw) => {
    const list = raw?.books || [];
    if (!prioritizeLang) return list;
    const inLang = list.filter((b) => b.orig_language === lang);
    return inLang.length ? inLang : list;
  };

  const fetchPage = async (s) => {
    const p = new URLSearchParams();
    if (lib) p.set('lib', lib);
    if (lang) p.set('lang', lang);
    if (topic) p.set('topic', topic);
    if (bookLang) p.set('bookLang', bookLang);
    p.set('skip', String(s));
    p.set('limit', String(limit));
    const res = await fetch(`/api/library?${p.toString()}`);
    if (!res.ok) throw new Error(`library ${res.status}`);
    return res.json();
  };

  const navigate = async (dir, e) => {
    if (e) e.preventDefault();
    if (busy) return;
    const newSkip = dir === 'next' ? skip + limit : Math.max(0, skip - limit);
    if (newSkip === skip) return;
    setBusy(true);
    try {
      const newBooks = shape(await fetchPage(newSkip));
      const prevBooks = books;
      setOutgoing({ books: prevBooks, dir });
      setBooks(newBooks);
      setSkip(newSkip);
      // Reflect the page in the URL without a Next navigation (keeps it shareable).
      window.history.replaceState(null, '', mk(newSkip));
      // Keep the grid in view if the arrows sit below the fold.
      rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      window.setTimeout(() => {
        setOutgoing(null);
        setBusy(false);
      }, 460);
    } catch {
      setBusy(false);
    }
  };

  // Exit direction for a "next" move: left in LTR, right in RTL. The incoming grid enters
  // from the opposite side.
  const fwdOutLeft = !rtl;
  const outClass = (dir) => {
    const outLeft = dir === 'next' ? fwdOutLeft : !fwdOutLeft;
    return outLeft ? 'slide-out-left' : 'slide-out-right';
  };
  const inClass = (dir) => {
    const outLeft = dir === 'next' ? fwdOutLeft : !fwdOutLeft;
    return outLeft ? 'slide-in-right' : 'slide-in-left'; // enter from the side we exited toward
  };

  const prevGlyph = rtl ? '›' : '‹';
  const nextGlyph = rtl ? '‹' : '›';

  const Grid = ({ list }) => (
    <div className="grid">
      {list.map((b) => (
        <BookCard key={b.bookId} book={b} lang={lang} t={t} />
      ))}
    </div>
  );

  return (
    <div className="anim-lib" ref={rootRef}>
      <div className={`anim-viewport ${outgoing ? 'is-animating' : ''}`}>
        {outgoing ? (
          <div className={`anim-layer anim-layer-out ${outClass(outgoing.dir)}`} aria-hidden="true">
            <Grid list={outgoing.books} />
          </div>
        ) : null}
        <div key={skip} className={`anim-layer ${outgoing ? inClass(outgoing.dir) : ''}`}>
          <Grid list={books} />
        </div>
      </div>

      {pages > 1 ? (
        <nav className="pager" aria-label="Pagination">
          {hasPrev ? (
            <a href={mk(Math.max(0, skip - limit))} className="pager-btn" rel="prev"
              aria-label="Previous" onClick={(e) => navigate('prev', e)}>{prevGlyph}</a>
          ) : (
            <span className="pager-btn pager-disabled">{prevGlyph}</span>
          )}
          <span className="pager-info">{page} / {pages}</span>
          {hasNext ? (
            <a href={mk(skip + limit)} className="pager-btn" rel="next"
              aria-label="Next" onClick={(e) => navigate('next', e)}>{nextGlyph}</a>
          ) : (
            <span className="pager-btn pager-disabled">{nextGlyph}</span>
          )}
        </nav>
      ) : null}
    </div>
  );
}
