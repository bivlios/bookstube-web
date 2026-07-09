'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

// Native flipbook reader for PUBLISHED books — renders the static page JPEGs with
// react-pageflip (StPageFlip). No iframe, no Meteor. `react-pageflip` is imported
// lazily (only when the reader opens) so it never runs during SSR and refs still work.
//
// Controlled by the parent (`open`/`onClose`) so the same overlay can be triggered
// from more than one place on the page (the cover image as well as the CTA button).
//
// RTL (he/ar): StPageFlip has no native RTL mode, so we reverse the page array before
// handing it to the engine — logical page 0 becomes the rightmost page and the book
// opens/flips right-to-left, matching how a Hebrew/Arabic book is actually read. All
// page numbers exposed to the reader (the counter, keyboard, buttons) stay in the
// natural 1..n logical order; the reversal is an internal detail. `toLogical()` converts
// the engine's internal index back to a logical page, and `startPageIndex` opens the
// book on logical page 0. (Technique ported from the `react-pageflip-rtl` fork; kept
// inline to avoid depending on an unmaintained single-author package.)
export default function BookReader({ open, onClose, pages, audio, pageWidth, pageHeight, rtl, label, listenLabel }) {
  const [Flip, setFlip] = useState(null);
  const bookRef = useRef(null);
  const [page, setPage] = useState(0); // logical page (0-based, matches `pages`)

  // Narration: `audio` is aligned with `pages` (null = silent page), pre-generated TTS
  // on S3 (books/tts/{bookId}/{i}.{mp3|wav}) served via the read API's reader.pageAudio.
  // Mirrors the Meteor viewer's auto-read (book-control-bar.jsx): play the visible
  // spread's audio in story order, then flip and continue until the book ends.
  const [narrating, setNarrating] = useState(false);
  const narratingRef = useRef(false);
  const audioElRef = useRef(null);
  const narrGen = useRef(0); // bump to invalidate in-flight playback chains

  const total = pages?.length || 0;
  const hasTts = Array.isArray(audio) && audio.some(Boolean);

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

  // ── Narration ──
  const stopAudio = () => {
    narrGen.current += 1;
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current = null;
    }
  };

  // Logical pages currently on screen, in story order. In landscape spread mode the
  // engine shows [ci, ci+1] except when a cover sits alone at either end.
  const visibleLogical = () => {
    const pf = pageFlip();
    if (!pf) return [page];
    const ci = pf.getCurrentPageIndex();
    const internal = [ci];
    if (pf.getOrientation?.() === 'landscape' && ci > 0 && ci + 1 < total) internal.push(ci + 1);
    return internal.map(toLogical).sort((a, b) => a - b);
  };

  // Play the visible spread's audio sequentially, then flip forward and continue
  // (onFlip re-enters here). Ends narration on the last page.
  const playSpread = () => {
    const gen = narrGen.current;
    const vis = visibleLogical();
    const queue = vis.filter((k) => audio?.[k]);
    const lastVisible = vis.length ? vis[vis.length - 1] : total - 1;

    const advanceOrStop = () => {
      if (gen !== narrGen.current) return;
      if (lastVisible < total - 1) goNext(); // onFlip restarts narration on the new spread
      else {
        setNarrating(false);
        narratingRef.current = false;
      }
    };

    const playIdx = (qi) => {
      if (gen !== narrGen.current) return;
      if (qi >= queue.length) return advanceOrStop();
      const a = new Audio(audio[queue[qi]]);
      audioElRef.current = a;
      a.onended = () => playIdx(qi + 1);
      a.onerror = () => playIdx(qi + 1);
      a.play().catch(() => playIdx(qi + 1));
    };

    if (queue.length) playIdx(0);
    else setTimeout(advanceOrStop, 900); // silent spread — keep the reading flow moving
  };

  const toggleNarration = () => {
    if (narratingRef.current) {
      stopAudio();
      setNarrating(false);
      narratingRef.current = false;
    } else {
      stopAudio(); // resets the generation counter
      setNarrating(true);
      narratingRef.current = true;
      setTimeout(playSpread, 50);
    }
  };

  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
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
  }, [open, rtl, onClose]);

  // Reset to the opening page whenever the reader closes, so re-opening starts fresh.
  // Also kill any playing narration — the component stays mounted while hidden.
  useEffect(() => {
    if (!open) {
      setPage(0);
      stopAudio();
      setNarrating(false);
      narratingRef.current = false;
    }
  }, [open]);

  const w = pageWidth || 450;
  const h = pageHeight || 450;

  // Glyphs follow reading direction: the "previous" control points back toward the
  // start of the book (left in LTR, right in RTL).
  const prevGlyph = rtl ? '›' : '‹';
  const nextGlyph = rtl ? '‹' : '›';

  if (!open) return null;

  return (
    <div className="reader-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={label}>
      <div className="native-reader" onClick={(e) => e.stopPropagation()}>
        <button className="reader-close" onClick={onClose} aria-label="Close">×</button>

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
              onFlip={(e) => {
                setPage(toLogical(e.data));
                // Any flip (auto-advance or manual) restarts narration on the new spread.
                if (narratingRef.current) {
                  stopAudio();
                  setTimeout(playSpread, 500); // let the flip animation settle
                }
              }}
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
          {hasTts ? (
            <button
              onClick={toggleNarration}
              className={`narr-btn ${narrating ? 'narr-on' : ''}`}
              aria-pressed={narrating}
              aria-label={listenLabel || 'Listen'}
              title={listenLabel || 'Listen'}
            >
              {narrating ? '⏸' : '🔊'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}