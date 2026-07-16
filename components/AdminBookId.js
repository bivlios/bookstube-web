'use client';

import { useEffect, useState } from 'react';

// Admin helper: appending #bid to any book URL reveals a copyable pill with the
// book's Mongo bookId (needed for taglib curation, DB lookups, support), styled to
// sit inline among the topic chips. Client-side on purpose — a hash never reaches
// the server, so book pages stay fully ISR-cached (a ?query= flag read in the page
// would force dynamic rendering on every request). The id isn't secret (it's the
// cover/reader URL filename), so no auth is needed.
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
      className="chip"
      onClick={copy}
      title="Copy book ID"
      style={{ direction: 'ltr', fontFamily: 'ui-monospace, monospace', cursor: 'pointer' }}
    >
      {copied ? '✓ copied' : `id: ${bookId}`}
    </button>
  );
}
