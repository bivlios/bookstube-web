'use client';

import { useEffect, useState } from 'react';

// Admin helper: appending #bid to any book URL reveals a copyable pill with the
// book's Mongo bookId (needed for taglib curation, DB lookups, support). Renders
// inline next to the Share button in the detail actions row. Client-side on
// purpose — a hash never reaches the server, so book pages stay fully ISR-cached
// (a ?query= flag read in the page would force dynamic rendering on every request).
// The id isn't secret (it's the cover/reader URL filename), so no auth is needed.
export default function AdminBookId({ bookId }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const check = () => setShow(window.location.hash === '#bid');
    check();
    window.addEventListener('hashchange', check);
    return () => window.removeEventListener('hashchange', check);
  }, []);

  if (!show) return null;

  const copy = () => {
    navigator.clipboard?.writeText(bookId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      type="button"
      onClick={copy}
      title="Copy book ID"
      style={{
        direction: 'ltr', padding: '6px 12px', borderRadius: 999,
        border: '1px solid rgba(255,255,255,.25)', background: 'rgba(20,16,44,.92)',
        color: '#fff', font: '13px/1.4 ui-monospace, monospace', cursor: 'pointer',
      }}
    >
      {copied ? '✓ copied' : `id: ${bookId}`}
    </button>
  );
}
