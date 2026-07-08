'use client';

import { useEffect, useRef, useState } from 'react';

// Native flipbook reader for PUBLISHED books — renders the static page JPEGs with
// react-pageflip (StPageFlip). No iframe, no Meteor. `react-pageflip` is imported
// lazily (only when the reader opens) so it never runs during SSR and refs still work.
//
// v1 note: pages are shown in reading order (0..n-1) with correct content; for RTL
// books the prev/next controls are swapped so tapping "forward" advances the story.
// True RTL spread layout (right-hand cover) is a later polish — StPageFlip has no
// native RTL mode.
export default function BookReader({ pages, pageWidth, pageHeight, rtl, label }) {
  const [open, setOpen] = useState(false);
  const [Flip, setFlip] = useState(null);
  const bookRef = useRef(null);
  const [page, setPage] = useState(0);

  const total = pages?.length || 0;

  useEffect(() => {
    if (open && !Flip) {
      import('react-pageflip').then((m) => setFlip(() => m.default)).catch(() => {});
    }
  }, [open, Flip]);

  const pageFlip = () => bookRef.current?.pageFlip?.();
  const next = () => pageFlip()?.flipNext();
  const prev = () => pageFlip()?.flipPrev();

  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
      else if (e.key === 'ArrowRight') (rtl ? prev() : next());
      else if (e.key === 'ArrowLeft') (rtl ? next() : prev());
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, rtl]);

  const w = pageWidth || 450;
  const h = pageHeight || 450;

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
                  onFlip={(e) => setPage(e.data)}
                  className="flipbook"
                >
                  {pages.map((src, i) => (
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
              <button onClick={rtl ? next : prev} aria-label="Previous">‹</button>
              <span>{Math.min(page + 1, total)} / {total}</span>
              <button onClick={rtl ? prev : next} aria-label="Next">›</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
