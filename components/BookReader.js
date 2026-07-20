'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

// Native flipbook reader for PUBLISHED books — renders the static page JPEGs with
// react-pageflip (StPageFlip). No iframe, no Meteor. `react-pageflip` is imported
// lazily (only when the reader opens) so it never runs during SSR and refs still work.
//
// The reader lives inline in the book page (always mounted for a published book). A
// `fullscreen` flag (owned by the parent so the cover / CTA can trigger it) restyles the
// same DOM node into a fixed overlay — the flipbook is never remounted, so the current
// page and any running narration survive the toggle. `size="stretch"` re-fits the book to
// whatever size the container becomes.
//
// Page model — a `slides` array (logical, LTR reading order) built from the source
// images: [cover, info, ...rest], padded with a blank page when the count is odd so
// StPageFlip can close on a lone back cover (an odd count leaves the last page paired
// and un-closable). The info page (title/author/brand) mirrors the old Meteor viewer.
//
// RTL (he/ar): StPageFlip has no native RTL mode, so we reverse the slides before
// handing them to the engine — logical slide 0 becomes the rightmost page and the book
// opens/flips right-to-left, matching how a Hebrew/Arabic book is actually read. All
// page numbers exposed to the reader stay in the natural 1..n logical order; the
// reversal is an internal detail. `toLogical()` converts the engine's internal index
// back to a logical slide, and `startPageIndex` opens the book on logical slide 0.
export default function BookReader({
  fullscreen, onFullscreenChange, pages, audio, pageWidth, pageHeight, rtl,
  label, listenLabel, title, author, illustrator, byLabel, poweredByLabel, brandLabel, brandHref,
  onComplete,
}) {
  const [Flip, setFlip] = useState(null);
  const bookRef = useRef(null);
  const embedRef = useRef(null); // outer container — observed for lazy engine load
  const [page, setPage] = useState(0); // logical slide (0-based)

  // Narration: each slide carries its own audio (null = silent). Pre-generated TTS on
  // S3 served via the read API's reader.pageAudio. Mirrors the Meteor viewer's auto-read:
  // play the visible spread's audio in story order, then flip and continue to book end.
  const [narrating, setNarrating] = useState(false);
  const narratingRef = useRef(false);
  const audioElRef = useRef(null);
  const narrGen = useRef(0); // bump to invalidate in-flight playback chains

  // Logical slides in reading order:
  //   [0] front cover (image)            — lone right-hand page when closed
  //   [1] inner front cover (blank)      — left page of the first spread
  //   [2] info page (title / author)     — right page of the first spread
  //   [3..] the rest of the story images — paired image|image spreads
  // Keeping the blank inner cover at index 1 makes the info page fall on the right of
  // the opening spread and keeps every content page on its intended side. When the count
  // is odd we splice one filler in *before* the last image (the back cover), so the book
  // still closes on a lone back cover instead of leaving it paired.
  const slides = useMemo(() => {
    const imgs = pages || [];
    if (!imgs.length) return [];
    const arr = [{ type: 'image', src: imgs[0], audio: audio?.[0] || null }]; // front cover
    arr.push({ type: 'blank', audio: null }); // inner front cover
    arr.push({ type: 'info', audio: null }); // title / info page
    for (let i = 1; i < imgs.length; i += 1) {
      arr.push({ type: 'image', src: imgs[i], audio: audio?.[i] || null });
    }
    if (arr.length % 2 !== 0) arr.splice(arr.length - 1, 0, { type: 'blank', audio: null });
    return arr;
  }, [pages, audio]);

  const total = slides.length; // engine slide count (includes info + blank padding)
  const countTotal = slides.filter((s) => s.type !== 'blank').length; // shown in "x / y"
  const hasTts = slides.some((s) => s.audio);

  // Slides handed to StPageFlip: reversed for RTL so the story reads right-to-left.
  const displaySlides = useMemo(
    () => (rtl ? [...slides].reverse() : slides),
    [slides, rtl],
  );

  // Engine internal index → logical (`slides`) index, and the reverse.
  const toLogical = (i) => (rtl ? total - 1 - i : i);
  const startPageIndex = rtl ? Math.max(total - 1, 0) : 0;

  // Lazy-load the flip engine when the reader scrolls near the viewport (or right away if
  // it's already opened fullscreen) so the page ships without executing StPageFlip for
  // visitors who never reach the book.
  useEffect(() => {
    if (Flip) return undefined;
    const load = () => import('react-pageflip').then((m) => setFlip(() => m.default)).catch(() => {});
    if (fullscreen) { load(); return undefined; }
    const el = embedRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') { load(); return undefined; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { load(); io.disconnect(); }
    }, { rootMargin: '400px' });
    io.observe(el);
    return () => io.disconnect();
  }, [Flip, fullscreen]);

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

  // Logical slides currently on screen, in story order. In landscape spread mode the
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
    const queue = vis.filter((k) => slides[k]?.audio);
    const lastVisible = vis.length ? vis[vis.length - 1] : total - 1;

    const advanceOrStop = () => {
      if (gen !== narrGen.current) return;
      if (lastVisible < total - 1) goNext(); // onFlip restarts narration on the new spread
      else {
        onComplete?.();
        setNarrating(false);
        narratingRef.current = false;
      }
    };

    const playIdx = (qi) => {
      if (gen !== narrGen.current) return;
      if (qi >= queue.length) return advanceOrStop();
      const a = new Audio(slides[queue[qi]].audio);
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

  // Only fullscreen locks page scroll and captures the keyboard — inline must never
  // hijack the page's scroll or arrow keys.
  useEffect(() => {
    if (!fullscreen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onFullscreenChange(false);
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
  }, [fullscreen, rtl, onFullscreenChange]);

  // Real browser fullscreen (like YouTube's) when the API is available. The .is-fullscreen
  // CSS overlay is the always-correct fallback (and what shows on iOS Safari, which has no
  // element fullscreen), so this is best-effort — rejections are ignored.
  useEffect(() => {
    const el = embedRef.current;
    if (!el) return undefined;
    const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
    if (fullscreen && !fsEl()) {
      (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el)?.catch?.(() => {});
    } else if (!fullscreen && fsEl()) {
      (document.exitFullscreen || document.webkitExitFullscreen)?.call(document)?.catch?.(() => {});
    }
    // The container changes size on toggle; StPageFlip only re-fits (`size="stretch"`) on a
    // window resize, so nudge it once the new layout settles — covers the CSS-only fallback
    // (iOS) where entering fullscreen fires no resize of its own.
    const nudge = setTimeout(() => window.dispatchEvent(new Event('resize')), 120);
    return () => clearTimeout(nudge);
  }, [fullscreen]);

  // Keep our state in sync when the user leaves native fullscreen via Esc / the browser UI.
  useEffect(() => {
    const onFsChange = () => {
      const active = document.fullscreenElement || document.webkitFullscreenElement;
      if (!active && fullscreen) onFullscreenChange(false);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, [fullscreen, onFullscreenChange]);

  const w = pageWidth || 450;
  const h = pageHeight || 450;

  // Glyphs follow reading direction: the "previous" control points back toward the
  // start of the book (left in LTR, right in RTL).
  const prevGlyph = rtl ? '›' : '‹';
  const nextGlyph = rtl ? '‹' : '›';

  // Fullscreen backdrop click (outside the book) collapses back to the inline reader.
  const onBackdrop = fullscreen ? () => onFullscreenChange(false) : undefined;

  return (
    <div
      ref={embedRef}
      className={`reader-embed${fullscreen ? ' is-fullscreen' : ''}`}
      // The open book's spread aspect-ratio (two pages side by side) — the CSS uses it
      // to shrink the reader's height to the book's own rendered height, so the control
      // bar sits right under the book instead of at the bottom of a fixed-height box.
      style={{ '--book-ar': (w * 2) / h }}
      onClick={onBackdrop}
      role={fullscreen ? 'dialog' : 'group'}
      aria-modal={fullscreen ? 'true' : undefined}
      aria-label={label}
    >
      <div className="native-reader" onClick={(e) => e.stopPropagation()}>
        {/* StPageFlip sizes the book from its block's WIDTH only (height = width/2 ·
            h/w), ignoring the container height — portrait-ish books came out taller
            than .flip-wrap and were clipped by its overflow:hidden. The sizer fixes
            the block's width via the book's own spread aspect-ratio against the
            available height, so the width-derived height always fits exactly. */}
        <div className="flip-wrap">
          <div className="flip-sizer" style={{ aspectRatio: `${w * 2} / ${h}` }}>
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
                const logicalPage = toLogical(e.data);
                setPage(logicalPage);
                // StPageFlip reports the left page of a final LTR spread and the
                // right page for RTL. Reaching either final spread counts once.
                if (logicalPage >= Math.max(total - 2, 0)) onComplete?.();
                // Any flip (auto-advance or manual) restarts narration on the new spread.
                if (narratingRef.current) {
                  stopAudio();
                  setTimeout(playSpread, 500); // let the flip animation settle
                }
              }}
              className="flipbook"
            >
              {displaySlides.map((slide, i) => (
                <div className="flip-page" key={i}>
                  {slide.type === 'info' ? (
                    <InfoPage
                      title={title}
                      author={author}
                      illustrator={illustrator}
                      byLabel={byLabel}
                      poweredByLabel={poweredByLabel}
                      brandLabel={brandLabel}
                      brandHref={brandHref}
                      rtl={rtl}
                    />
                  ) : slide.type === 'blank' ? (
                    <div className="flip-blank">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="flip-blank-mark" src="/images/bg-logo-bw.png" alt="" draggable={false} />
                    </div>
                  ) : (
                    <FlipImage src={slide.src} />
                  )}
                </div>
              ))}
            </Flip>
          ) : (
            <div className="reader-loading">…</div>
          )}
          </div>
        </div>

        {/* Control bar below the book (inline). In fullscreen, CSS `order` lifts it above. */}
        <div className="reader-bar" dir={rtl ? 'rtl' : 'ltr'}>
          <div className="reader-bar-meta">
            {title ? <span className="rb-title">{title}</span> : null}
            {author ? <span className="rb-author">{byLabel}{author}</span> : null}
          </div>
          <div className="reader-bar-controls">
            <button onClick={goPrev} aria-label="Previous">{prevGlyph}</button>
            <span className="rb-count" dir="ltr">{Math.min(page + 1, countTotal)} / {countTotal}</span>
            <button onClick={goNext} aria-label="Next">{nextGlyph}</button>
            {hasTts ? (
              <button
                onClick={toggleNarration}
                className={`narr-btn ${narrating ? 'narr-on' : ''}`}
                aria-pressed={narrating}
                aria-label={listenLabel || 'Listen'}
                title={listenLabel || 'Listen'}
              >
                {narrating ? <PauseIcon /> : <SpeakerIcon />}
                <span className="narr-label">{listenLabel || 'Listen'}</span>
              </button>
            ) : null}
            <button
              className="fs-btn"
              onClick={() => onFullscreenChange(!fullscreen)}
              aria-pressed={fullscreen}
              aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {fullscreen ? '⤢' : '⛶'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// White SVG glyphs for the narration toggle — an emoji speaker rendered dark and got
// lost against the bar, and emoji can't be recolored; these follow `currentColor`.
function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M3 9v6h4l5 5V4L7 9H3z" />
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
      <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}

// Per-page image with a loading placeholder — the page JPEGs can be large, so without
// this the sheet shows blank white until the image arrives. The spinner sits under the
// image and the image fades in once decoded (or hides itself if it fails to load).
function FlipImage({ src }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="flip-img-wrap">
      {!loaded ? <span className="flip-spinner" aria-hidden="true" /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        draggable={false}
        className="flip-img"
        style={{ opacity: loaded ? 1 : 0 }}
        onLoad={() => setLoaded(true)}
        onError={(e) => { setLoaded(true); e.currentTarget.style.visibility = 'hidden'; }}
      />
    </div>
  );
}

// Info sheet inserted right after the cover — title, author, the Books Giant logo, and
// a "powered by Books Giant" credit linking back to the site, echoing the old Meteor
// viewer's info page.
function InfoPage({ title, author, illustrator, byLabel, poweredByLabel, brandLabel, brandHref, rtl }) {
  return (
    <div className="flip-info" dir={rtl ? 'rtl' : 'ltr'}>
      <div className="flip-info-inner">
        {title ? <h2 className="flip-info-title">{title}</h2> : null}
        {author ? (
          <p className="flip-info-line">{byLabel}<strong>{author}</strong></p>
        ) : null}
        {illustrator ? (
          <p className="flip-info-line flip-info-illus">{illustrator}</p>
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="flip-info-logo" src="/images/bg-logo-bw.png" alt="" draggable={false} />
        {(poweredByLabel || brandLabel) ? (
          <p className="flip-info-brand">
            {poweredByLabel}
            {brandHref ? (
              <a href={brandHref} target="_blank" rel="noopener">{brandLabel}</a>
            ) : (
              <span>{brandLabel}</span>
            )}
          </p>
        ) : null}
      </div>
    </div>
  );
}
