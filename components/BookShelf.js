'use client';

import { useEffect, useRef, useState } from 'react';
import { isRTL } from '@/lib/i18n';
import BookCard from './BookCard';

// One "shelf" — a frosted panel holding a single horizontal row of BookCards that
// scroll-snaps sideways (see the school project's tag-library shelves). Desktop gets
// prev/next arrows; touch users just swipe (arrows hidden via @media (hover:none)).
// Arrows are hidden when the row doesn't overflow. RTL flips the scroll direction and
// the arrow glyphs so "next" always moves forward through the books.
export default function BookShelf({ books, lang, t }) {
  const rtl = isRTL(lang);
  const rowRef = useRef(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return undefined;
    const check = () => setOverflow(el.scrollWidth - el.clientWidth > 4);
    check();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(check) : null;
    ro?.observe(el);
    window.addEventListener('resize', check);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', check);
    };
  }, [books]);

  // dir: -1 = toward the start of the reading order, +1 = forward. scrollLeft grows
  // positive in LTR and negative in RTL, so the sign is flipped for RTL.
  const scrollByDir = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    const amount = Math.max(240, el.clientWidth * 0.8) * (rtl ? -dir : dir);
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const prevGlyph = rtl ? '›' : '‹';
  const nextGlyph = rtl ? '‹' : '›';

  return (
    <div className="shelf">
      <div className="shelf-head">
        <span className="shelf-badge">
          <span className="shelf-badge-icon" aria-hidden="true">📚</span>
          {books.length}
        </span>
      </div>

      {overflow ? (
        <button
          type="button"
          className="shelf-arrow shelf-prev"
          onClick={() => scrollByDir(-1)}
          aria-label="Previous"
        >
          {prevGlyph}
        </button>
      ) : null}

      <div className="shelf-row" ref={rowRef}>
        {books.map((b) => (
          <BookCard key={b.bookId} book={b} lang={lang} t={t} />
        ))}
      </div>

      {overflow ? (
        <button
          type="button"
          className="shelf-arrow shelf-next"
          onClick={() => scrollByDir(1)}
          aria-label="Next"
        >
          {nextGlyph}
        </button>
      ) : null}
    </div>
  );
}
