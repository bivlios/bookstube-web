'use client';

// Manual test page for the native flipbook (see docs/native-player.md "Verification").
// Renders BookReader over a real published book's assets, including per-page TTS audio,
// without needing the read API's reader.pageAudio (useful until the Galaxy deploy).
// NOT linked from anywhere; remove before/after QA if you don't want it deployed.
import { useState } from 'react';
import BookReader from '@/components/BookReader';

const BOOK_ID = 'Sah38w4kETuQFmYZh'; // למה הפנדות צמחוניות? — 16 pages, narrated (he)
const S3 = 'https://s3-eu-west-1.amazonaws.com/school.booksgiant.com';

const pages = Array.from({ length: 16 }, (_, i) => `${S3}/books/pages/${BOOK_ID}/${i}.jpeg`);
// Real pre-generated TTS files on S3 (wav). Pages without audio stay null (silent).
const audio = pages.map((_, i) => (i <= 1 ? `${S3}/books/tts/${BOOK_ID}/${i}.wav` : null));

export default function ReaderTest() {
  const [fullscreen, setFullscreen] = useState(false);
  return (
    <main style={{ padding: 40, textAlign: 'center' }}>
      <h1>Reader test — inline + TTS narration (RTL)</h1>
      <button className="btn btn-primary" onClick={() => setFullscreen(true)}>
        Open fullscreen
      </button>
      <BookReader
        fullscreen={fullscreen}
        onFullscreenChange={setFullscreen}
        pages={pages}
        audio={audio}
        pageWidth={450}
        pageHeight={450}
        rtl
        label="Reader test"
        listenLabel="הקראת הסיפור"
        title="למה הפנדות צמחוניות?"
        author="ילדים כתבו"
        byLabel=" מאת "
        poweredByLabel="נוצר ב "
        brandLabel="ענק של ספרים"
        brandHref="https://booksgiant.com/he"
      />
    </main>
  );
}
