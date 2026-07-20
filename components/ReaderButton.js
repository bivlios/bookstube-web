'use client';

import { useEffect, useRef } from 'react';

// Opens the existing Meteor viewer (library.booksgiant.com/sample-book/:id/:lang)
// in a fullscreen iframe dialog. Player + TTS live inside the iframe.
//
// Controlled by the parent (`open`/`onClose`) so the same overlay can be triggered
// from more than one place on the page (the cover image as well as the CTA button).
//
// Language handoff: the viewer reads the URL :lang on mount, but it also listens
// for a postMessage ({lang} or {type:'setLanguage', lang}). Its message listener
// attaches only after the Meteor SPA boots — which is *after* iframe onLoad — so a
// single on-load post can miss. We post on load and retry a few times until the
// listener is up, and also reply if the viewer ever asks the parent for a language.
export default function ReaderButton({ open, onClose, readerUrl, lang, label, onComplete }) {
  const iframeRef = useRef(null);
  const meaningfullyEngagedRef = useRef(false);
  const src = `${readerUrl}/${lang}`;

  // Only ever message the reader host itself.
  let readerOrigin = '*';
  try {
    readerOrigin = new URL(readerUrl).origin;
  } catch (e) {
    /* keep '*' */
  }

  useEffect(() => {
    if (!open) return undefined;
    meaningfullyEngagedRef.current = false;
    const engagementTimer = setTimeout(() => {
      meaningfullyEngagedRef.current = true;
    }, 30000);

    const send = () => {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;
      win.postMessage({ type: 'setLanguage', lang }, readerOrigin);
      win.postMessage({ lang }, readerOrigin); // the viewer also accepts the bare shape
    };

    // Retry until the viewer's (post-boot) message listener is attached.
    const timers = [0, 300, 800, 1600, 2800].map((ms) => setTimeout(send, ms));

    // If the viewer proactively signals readiness, answer immediately.
    const onMessage = (e) => {
      if (e.origin !== readerOrigin) return;
      const d = e.data;
      const asked =
        d === 'ready' ||
        d?.type === 'ready' ||
        d?.type === 'readerReady' ||
        d?.type === 'requestLanguage';
      if (asked) send();
    };
    window.addEventListener('message', onMessage);

    return () => {
      clearTimeout(engagementTimer);
      timers.forEach(clearTimeout);
      window.removeEventListener('message', onMessage);
    };
  }, [open, lang, readerOrigin]);

  // The legacy reader is cross-origin and does not expose page-completion events.
  // Closing it after 30 seconds is the conservative meaningful-engagement fallback.
  const closeReader = () => {
    if (meaningfullyEngagedRef.current) onComplete?.();
    onClose();
  };

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') closeReader();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, onComplete]);

  if (!open) return null;

  return (
    <div
      className="reader-overlay"
      onClick={closeReader}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div className="reader-frame" onClick={(e) => e.stopPropagation()}>
        <button className="reader-close" onClick={closeReader} aria-label="Close">
          ×
        </button>
        <iframe
          ref={iframeRef}
          src={src}
          title={label}
          onLoad={() => {
            const win = iframeRef.current?.contentWindow;
            if (!win) return;
            win.postMessage({ type: 'setLanguage', lang }, readerOrigin);
            win.postMessage({ lang }, readerOrigin);
          }}
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      </div>
    </div>
  );
}
