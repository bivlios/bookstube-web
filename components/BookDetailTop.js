'use client';

import { useState } from 'react';
import { makeT } from '@/lib/i18n';
import BookReader from './BookReader';
import ReaderButton from './ReaderButton';
import CoverImage from './CoverImage';
import AdminBookId from './AdminBookId';

// Cover + facts + CTAs for the book detail page. Holds the reader's open state so
// clicking the cover image opens the same overlay as the "Read illustrated book" CTA.
// `t` (a closure) can't cross the server/client boundary as a prop, so this builds
// its own translator from the plain `lang` string instead.
export default function BookDetailTop({ book, lang, bDir, readingMinutes, similarHref }) {
  const t = makeT(lang);
  const usesNative = book.reader?.published && book.reader.pageCount > 0;
  // Native books show a live inline reader; `fullscreen` expands it. Legacy iframe books
  // keep the button→modal flow via `open`.
  const [fullscreen, setFullscreen] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const readLabel = t('bookPage.readNow');
  const openReader = () => (usesNative ? setFullscreen(true) : setOpen(true));

  // Copies the book's clean URL (origin + path only — no #bid hash, no query params) so
  // "share" always yields a pasteable link, instead of the OS share sheet that surfaces
  // Reading List / Notes / etc. decodeURI: Hebrew/Arabic slugs come percent-encoded from
  // location — copy the readable form so the link doesn't look like garbage in WhatsApp.
  const share = async () => {
    let url = window.location.origin + window.location.pathname;
    try { url = decodeURI(url); } catch (e) { /* malformed — share encoded form */ }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) { window.prompt(t('bookPage.share'), url); }
  };

  return (
    <>
      <div className="detail-top">
        <button
          type="button"
          className="detail-cover-btn"
          onClick={openReader}
          aria-label={readLabel}
        >
          <CoverImage
            src={book.coverUrl}
            fallbacks={book.reader?.published ? [book.reader.pageImages?.[0]] : []}
            title={book.title}
            author={book.author?.name}
            seed={book.bookId}
            className="detail-cover"
          />
          <span className="cover-play-hint" aria-hidden="true">▶</span>
        </button>

        <div className="detail-info" dir={bDir}>
          <h1>{book.title}</h1>
          {book.author?.name ? <p className="author">{t('book.by')}{book.author.name}</p> : null}

          <div className="facts">
            {book.age ? <span>{t('bookPage.age')}: {book.age.min}–{book.age.max}</span> : null}
            <span>{t('bookPage.readingTime')}: ~{readingMinutes} {t('bookPage.minutes')}</span>
            <span>{t('bookPage.language')}: {(book.orig_language || '').toUpperCase()}</span>
          </div>

          {book.summery ? <p className="summary">{book.summery}</p> : null}

          <div className="topics-inline">
            {book.topics?.map((tp) => (
              <span key={tp} className="chip">{tp}</span>
            ))}
            <AdminBookId bookId={book.bookId} />
          </div>

          <div className="detail-actions">
            <button type="button" className="btn btn-read" onClick={openReader}>
              {readLabel}
            </button>
            <a className="btn btn-outline" href={similarHref} target="_blank" rel="noopener">
              {t('bookPage.createSimilar')}
            </a>
            <button type="button" className="btn btn-outline btn-share" onClick={share}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 1 0-3-3c0 .24.04.47.09.7L8.04 9.81A2.99 2.99 0 0 0 3 12a3 3 0 0 0 5.04 2.19l7.12 4.16c-.05.21-.08.43-.08.65a2.92 2.92 0 1 0 2.92-2.92z" />
              </svg>
              {copied ? t('bookPage.linkCopied') : t('bookPage.share')}
            </button>
          </div>
        </div>
      </div>

      {usesNative ? (
        <BookReader
          fullscreen={fullscreen}
          onFullscreenChange={setFullscreen}
          pages={book.reader.pageImages}
          audio={book.reader.pageAudio}
          pageWidth={book.reader.pageWidth}
          pageHeight={book.reader.pageHeight}
          rtl={bDir === 'rtl'}
          label={readLabel}
          listenLabel={t('bookPage.listen')}
          title={book.title}
          author={book.author?.name}
          illustrator={book.illustrator?.name}
          byLabel={t('book.by')}
          poweredByLabel={t('book.powerdby')}
          brandLabel={t('book.booksgiant')}
          brandHref={`https://booksgiant.com/${lang}`}
        />
      ) : (
        <ReaderButton
          open={open}
          onClose={() => setOpen(false)}
          readerUrl={book.readerUrl}
          lang={lang}
          label={readLabel}
        />
      )}
    </>
  );
}
