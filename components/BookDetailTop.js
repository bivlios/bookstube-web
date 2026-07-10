'use client';

import { useState } from 'react';
import { makeT } from '@/lib/i18n';
import BookReader from './BookReader';
import ReaderButton from './ReaderButton';

// Cover + facts + CTAs for the book detail page. Holds the reader's open state so
// clicking the cover image opens the same overlay as the "Read illustrated book" CTA.
// `t` (a closure) can't cross the server/client boundary as a prop, so this builds
// its own translator from the plain `lang` string instead.
export default function BookDetailTop({ book, lang, bDir, readingMinutes, similarHref }) {
  const t = makeT(lang);
  const [open, setOpen] = useState(false);
  const usesNative = book.reader?.published && book.reader.pageCount > 0;
  const readLabel = t('bookPage.readNow');

  return (
    <div className="detail-top">
      <button
        type="button"
        className="detail-cover-btn"
        onClick={() => setOpen(true)}
        aria-label={readLabel}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={book.coverUrl} alt={book.title} className="detail-cover" />
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

        {book.topics?.length ? (
          <div className="topics-inline">
            {book.topics.map((tp) => (
              <span key={tp} className="chip">{tp}</span>
            ))}
          </div>
        ) : null}

        <div className="detail-actions">
          <button type="button" className="btn btn-read" onClick={() => setOpen(true)}>
            {readLabel}
          </button>
          <a className="btn btn-outline" href={similarHref} target="_blank" rel="noopener">
            {t('bookPage.createSimilar')}
          </a>
        </div>
      </div>

      {usesNative ? (
        <BookReader
          open={open}
          onClose={() => setOpen(false)}
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
    </div>
  );
}
