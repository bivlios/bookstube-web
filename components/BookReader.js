'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

// Native flipbook reader for PUBLISHED books — renders the static page JPEGs with
// react-pageflip (StPageFlip). No iframe, no Meteor. `react-pageflip` is imported
// lazily (only when the reader opens) so it never runs during SSR and refs still work.
//
// RTL (he/ar): StPageFlip has no native RTL mode, so we reverse the page array before
// handing it to the engine — logical page 0 becomes the rightmost page and the book
// opens/flips right-to-left, matching how a Hebrew/Arabic book is actually read. All
// page numbers exposed to the reader (the counter, keyboard, buttons) stay in the
// natural 1..n logical order; the reversal is an internal detail. `toLogical()` converts
// the engine's internal index back to a logical page, and `startPageIndex` opens the
// book on logical page 0. (Technique ported from the `react-pageflip-rtl` fork; kept
// inline to avoid depending on an unmaintained single-author package.)
export default function BookReader({ pages, pageWidth, pageHeight, rtl, label }) {
  const [open, setOpen] = useState(false);
  const [Flip, setFlip] = useState(null);
  const bookRef = useRef(null);
  const [page, setPage] = useState(0); // logical page (0-based, matches `pages`)

  const total = pages?.length || 0;

  // Pages handed to StPageFlip: reversed for RTL so the story reads right-to-left.
  const displayPages = useMemo(
    () => (rtl ? [...(pages || [])].reverse() : pages || []),
    [pages, rtl],
  );

  // Engine internal index → logical (original `pages`) index, and the reverse.
  const toLogical = (i) => (rtl ? total - 1 - i : i);
  const startPageIndex = rtl ? Math.max(total - 1, 0) : 0;

  useEffect(() => {
    if (open && !Flip) {
      import('react-pageflip').then((m) => setFlip(() => m.default)).catch(() => {});
    }
  }, [open, Flip]);

  const pageFlip = () => bookRef.current?.pageFlip?.();
  // Logical navigation: "next" always advances the story. For RTL, advancing the story
  // means moving toward a lower internal index, i.e. the engine's flipPrev.
  const goNext = () => (rtl ? pageFlip()?.flipPrev() : pageFlip()?.flipNext());
  const goPrev = () => (rtl ? pageFlip()?.flipNext() : pageFlip()?.flipPrev());

  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
      // Arrow keys map to physical book direction: the right arrow always turns the
      // page on the right (advances in LTR, goes back in RTL), and vice-versa.
      else if (e.key === 'ArrowRight') (rtl ? goPrev() : goNext());
      else if (e.key === 'ArrowLeft') (rtl ? goNext() : goPrev());
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, rtl]);

  // Reset to the opening page whenever the reader closes, so re-opening starts fresh.
  useEffect(() => {
    if (!open) setPage(0);
  }, [open]);

  const w = pageWidth || 450;
  const h = pageHeight || 450;

  // Glyphs follow reading direction: the "previous" control points back toward the
  // start of the book (left in LTR, right in RTL).
  const prevGlyph = rtl ? '›' : '‹';
  const nextGlyph = rtl ? '‹' : '›';

  return (
    <>
      <button className="btn btn-read" onClick={() => setOpen(true)}>
        {label}
      </button>

      {open && (
        <div className="reader-overlay" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label={label}>
          <div className="native-reader" onClick={(e) => e.stopPropagation()}>
            <button className="reader-close" onClick={() => setOpen(false)} aria-label="Close">×</button>

            <div className="flip-wrap">
              {Flip ? (
                <Flip
                  ref={bookRef}
                  width={w}
                  height={h}
                  size="stretch"
                  minWidth={280}
                  maxWidth={1200}
                  minHeight={280}
                  maxHeight={1600}
                  maxShadowOpacity={0.3}
                  showCover
                  mobileScrollSupport
                  startPage={startPageIndex}
                  onFlip={(e) => setPage(toLogical(e.data))}
                  className="flipbook"
                >
                  {displayPages.map((src, i) => (
                    <div className="flip-page" key={i}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt=""
                        draggable={false}
                        onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                      />
                    </div>
                  ))}
                </Flip>
              ) : (
                <div className="reader-loading">…</div>
              )}
            </div>

            <div className="reader-controls" dir={rtl ? 'rtl' : 'ltr'}>
              <button onClick={goPrev} aria-label="Previous">{prevGlyph}</button>
              <span dir="ltr">{Math.min(page + 1, total)} / {total}</span>
              <button onClick={goNext} aria-label="Next">{nextGlyph}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}