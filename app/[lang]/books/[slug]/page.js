import { notFound } from 'next/navigation';
import { getBook } from '@/lib/api';
import { makeT, dir } from '@/lib/i18n';
import { tubeCta, SITE_URL } from '@/lib/cta';
import LibraryGrid from '@/components/LibraryGrid';
import ReaderButton from '@/components/ReaderButton';
import BookReader from '@/components/BookReader';

export const revalidate = 600;

const bookDir = (lang) => (lang === 'he' || lang === 'ar' ? 'rtl' : 'ltr');

export async function generateMetadata({ params }) {
  const slug = decodeURIComponent(params.slug);
  const data = await getBook(slug, { seo: 1 }).catch(() => null);
  if (!data) return {};
  const b = data.book;
  const title = b.title;
  const description = b.summery || (data.paragraphs?.[0] || '').slice(0, 160);
  const url = `/${params.lang}/books/${encodeURIComponent(b.slug || b.bookId)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'book', images: [b.coverUrl] },
    twitter: { card: 'summary_large_image', title, description, images: [b.coverUrl] },
  };
}

export default async function BookDetail({ params }) {
  const slug = decodeURIComponent(params.slug);
  const data = await getBook(slug, { fromTag: 'bookstube', seo: 1 }).catch(() => null);
  if (!data) notFound();

  const { book, readingMinutes, related, paragraphs } = data;
  const { lang } = params;
  const t = makeT(lang);
  const bDir = bookDir(book.orig_language);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    inLanguage: book.orig_language,
    image: book.coverUrl,
    ...(book.summery ? { description: book.summery } : {}),
    url: `${SITE_URL}/${lang}/books/${encodeURIComponent(book.slug || book.bookId)}`,
    ...(book.author?.name ? { author: { '@type': 'Person', name: book.author.name } } : {}),
  };

  return (
    <main dir={dir(lang)} className="detail">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <a href={`/${lang}`} className="back">← {t('bookPage.backToLibrary')}</a>

      <div className="detail-top">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={book.coverUrl} alt={book.title} className="detail-cover" />
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
            {book.reader?.published && book.reader.pageCount > 0 ? (
              <BookReader
                pages={book.reader.pageImages}
                pageWidth={book.reader.pageWidth}
                pageHeight={book.reader.pageHeight}
                rtl={bDir === 'rtl'}
                label={t('bookPage.readNow')}
              />
            ) : (
              <ReaderButton readerUrl={book.readerUrl} lang={lang} label={t('bookPage.readNow')} />
            )}
            <a className="btn btn-outline" href={tubeCta('book_detail_similar')} target="_blank" rel="noopener">
              {t('bookPage.createSimilar')}
            </a>
          </div>
        </div>
      </div>

      {/* Full story text — crawlable content (same words the illustrated pages show) */}
      {paragraphs?.length ? (
        <section className="book-text" dir={bDir}>
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>
      ) : null}

      {related?.length ? (
        <section className="related">
          <h2>{t('bookPage.related')}</h2>
          <LibraryGrid books={related} lang={lang} t={t} />
        </section>
      ) : null}
    </main>
  );
}
