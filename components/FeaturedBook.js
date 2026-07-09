import { langBadge } from '@/lib/i18n';

const bookDir = (l) => (l === 'he' || l === 'ar' ? 'rtl' : 'ltr');

// "Featured book" card near the top of the home page. `data` is a full /book/:id
// payload (so age + reading time are available, unlike the library list items).
export default function FeaturedBook({ data, lang, t }) {
  const b = data?.book;
  if (!b) return null;
  const href = `/${lang}/books/${encodeURIComponent(b.slug || b.bookId)}`;
  const badge = langBadge(b.orig_language);

  return (
    <section className="featured" aria-label={t('bookstubeHome.featuredLabel')}>
      <div className="featured-card">
        <a href={href} className="featured-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.coverUrl} alt={b.title} loading="lazy" />
        </a>
        <div className="featured-body" dir={bookDir(b.orig_language)}>
          <span className="featured-label">★ {t('bookstubeHome.featuredLabel')}</span>
          <h2 className="featured-title">{b.title}</h2>
          {b.author?.name ? (
            <p className="featured-author">{t('book.by')}{b.author.name}</p>
          ) : null}
          <div className="facts featured-facts">
            {b.age ? <span>{t('bookPage.age')}: {b.age.min}–{b.age.max}</span> : null}
            {data.readingMinutes ? (
              <span>~{data.readingMinutes} {t('bookPage.minutes')}</span>
            ) : null}
            {badge ? <span>{badge}</span> : null}
          </div>
          {b.summery ? <p className="featured-summary">{b.summery}</p> : null}
          <a className="btn btn-primary" href={href}>
            {t('bookstubeHome.featuredRead')}
          </a>
        </div>
      </div>
    </section>
  );
}
