import { langBadge } from '@/lib/i18n';

// Server component — a real crawlable <article> + <a href> per book.
export default function BookCard({ book, lang, t }) {
  const href = `/${lang}/books/${encodeURIComponent(book.slug || book.bookId)}`;
  const title = book.translated_title || book.title || '';
  const author = (book.author?.name || '').trim().split(' ')[0];
  const badge = langBadge(book.orig_language);

  return (
    <article className="card">
      <a href={href} className="card-link">
        <span className="card-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={book.coverUrl} alt={title} loading="lazy" />
          {badge ? <span className="lang-badge">{badge}</span> : null}
        </span>
        <h3 className="card-title">{title}</h3>
        {author ? <p className="card-author">{t('book.by')}{author}</p> : null}
      </a>
    </article>
  );
}
