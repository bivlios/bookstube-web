import { notFound } from 'next/navigation';
import { getBook, viewPingUrl } from '@/lib/api';
import ViewPing from '@/components/ViewPing';
import { makeT, dir } from '@/lib/i18n';
import { tubeCta, SITE_URL } from '@/lib/cta';
import { DEFAULT_POOL_TAGS } from '@/lib/libraries';
import LibraryGrid from '@/components/LibraryGrid';
import BookDetailTop from '@/components/BookDetailTop';
import BackButton from '@/components/BackButton';
import StoryText from '@/components/StoryText';

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
  // tags scope the related-books strip (fromTag = legacy param for the pre-tags API).
  const data = await getBook(slug, { fromTag: 'bookstube', tags: DEFAULT_POOL_TAGS, seo: 1 }).catch(() => null);
  if (!data) notFound();

  const { book, readingMinutes, related, paragraphs } = data;
  const { lang } = params;
  const t = makeT(lang);
  const bDir = bookDir(book.orig_language);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    identifier: book.bookId,
    inLanguage: book.orig_language,
    image: book.coverUrl,
    ...(book.summery ? { description: book.summery } : {}),
    url: `${SITE_URL}/${lang}/books/${encodeURIComponent(book.slug || book.bookId)}`,
    ...(book.author?.name ? { author: { '@type': 'Person', name: book.author.name } } : {}),
    ...(book.age ? { typicalAgeRange: `${book.age.min}-${book.age.max}` } : {}),
    ...(book.reader?.tts ? { accessibilityFeature: ['readAloud'] } : {}),
  };

  return (
    <main dir={dir(lang)} className="detail">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ViewPing url={viewPingUrl(book.bookId)} bookId={book.bookId} />

      <BackButton lang={lang} label={t('bookPage.backToLibrary')} />

      <BookDetailTop
        book={book}
        lang={lang}
        bDir={bDir}
        readingMinutes={readingMinutes}
        similarHref={tubeCta('book_detail_similar')}
      />

      {/* Full story text stays in the HTML for SEO but is visually collapsed to a
          short preview, expanded via the toggle (same words the illustrated pages show). */}
      {paragraphs?.length ? (
        <StoryText
          paragraphs={paragraphs}
          dir={bDir}
          heading={t('bookPage.storyHeading')}
          showLabel={t('bookPage.showStory')}
          hideLabel={t('bookPage.hideStory')}
        />
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
