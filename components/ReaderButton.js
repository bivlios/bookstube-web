'use client';

import { useState } from 'react';

// Opens the existing Meteor viewer (library.booksgiant.com/sample-book/:id) in a
// fullscreen iframe dialog. Player + TTS live inside the iframe (Phase 1).
export default function ReaderButton({ readerUrl, lang, label }) {
  const [open, setOpen] = useState(false);
  const src = `${readerUrl}/${lang}`;

  return (
    <>
      <button className="btn btn-read" onClick={() => setOpen(true)}>
        {label}
      </button>
      {open && (
        <div className="reader-overlay" onClick={() => setOpen(false)}>
          <div className="reader-frame" onClick={(e) => e.stopPropagation()}>
            <button
              className="reader-close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <iframe
              src={src}
              title={label}
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}
