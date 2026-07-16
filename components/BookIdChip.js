'use client';

import { useState } from 'react';

// Always-visible chip showing the book's Mongo bookId, styled to sit inline among the
// topic chips — needed constantly for taglib curation, DB lookups, support, so it isn't
// worth hiding behind an admin gesture. The id isn't secret (it's the cover/reader URL
// filename already). Client component only for the copy-to-clipboard interaction.
export default function BookIdChip({ bookId }) {
  const [copied, setCopied] = useState(false);

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
