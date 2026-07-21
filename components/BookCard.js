import { dir, langBadge } from '@/lib/i18n';
import CoverImage from './CoverImage';

// Server component — a real crawlable <article> + <a href> per book.
export default function BookCard({ book, lang, t }) {
  const href = `/${lang}/books/${encodeURIComponent(book.slug || book.bookId)}`;
  const title = book.translated_title || book.title || '';
  const author = (book.author?.name || '').trim().split(' ')[0];
  const badge = langBadge(book.orig_language);
  const textDir = dir(book.orig_language);

  return (
    <article className="card">
      <a href={href} className="card-link">
        <span className="card-cover">
          <CoverImage src={book.coverUrl} title={title} author={book.author?.name} seed={book.bookId} loading="lazy" />
          {badge ? <span className="lang-badge">{badge}</span> : null}
          {book.views > 1 ? (
            <span className="views-badge">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
              </svg>
              {book.views}
            </span>
          ) : null}
        </span>
        <h3 className="card-title" dir={textDir}>{title}</h3>
        {author ? <p className="card-author" dir={textDir}>{t('book.by')}{author}</p> : null}
      </a>
    </article>
  );
}
