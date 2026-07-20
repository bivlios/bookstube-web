import { notFound } from 'next/navigation';
import { getBook, getLibrary, viewPingUrl } from '@/lib/api';
import ViewPing from '@/components/ViewPing';
import { makeT, dir } from '@/lib/i18n';
import { tubeCreateAnonymCta, SITE_URL } from '@/lib/cta';
import { DEFAULT_POOL_TAGS } from '@/lib/libraries';
import { rankRelatedBooks, relatedQueryTags } from '@/lib/related';
import LibraryGrid from '@/components/LibraryGrid';
import BookDetailTop from '@/components/BookDetailTop';
import BackButton from '@/components/BackButton';
import StoryText from '@/components/StoryText';
import BookOpenTracker from '@/components/BookOpenTracker';
import PostReadConversion from '@/components/PostReadConversion';

export const revalidate = 600;
const RELATED_LIMIT = 8;
const RELATED_CANDIDATE_LIMIT = 60;

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
  // The API detail payload supplies the book and full story text. Related books
  // are selected below so their language and metadata can match this book.
  const data = await getBook(slug, { seo: 1 }).catch(() => null);
  if (!data) notFound();

  const { book, readingMinutes, paragraphs } = data;
  const { lang } = params;
  const t = makeT(lang);
  const bDir = bookDir(book.orig_language);
  const bookPath = `/${lang}/books/${encodeURIComponent(book.slug || book.bookId)}`;
  const bookAnalytics = {
    book_id: book.bookId,
    book_title: book.title,
    category: book.topics?.[0] || '',
    language: book.orig_language || lang,
  };

  // Build the strip from books that share the current book's original language.
  // Prefer candidates sharing real subject tags; if that pool is too small, fill
  // from the broad BooksTube catalog. Ranking removes the current book, rewards
  // shared topics/age/author, and varies deterministic tie-breaks per book.
  const queryTags = relatedQueryTags(book);
  const topicalData = queryTags.length
    ? await getLibrary({
      tags: queryTags.join(','),
      bookLang: book.orig_language,
      limit: RELATED_CANDIDATE_LIMIT,
    }).catch(() => null)
    : null;
  let candidates = topicalData?.books || [];
  let related = rankRelatedBooks(book, candidates, RELATED_LIMIT);

  if (related.length < RELATED_LIMIT) {
    const fallbackData = await getLibrary({
      tags: DEFAULT_POOL_TAGS,
      bookLang: book.orig_language,
      limit: RELATED_CANDIDATE_LIMIT,
    }).catch(() => null);
    candidates = [...candidates, ...(fallbackData?.books || [])];
    related = rankRelatedBooks(book, candidates, RELATED_LIMIT);
  }

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
      <BookOpenTracker analytics={bookAnalytics} />

      <BackButton lang={lang} label={t('bookPage.backToLibrary')} />

      <BookDetailTop
        book={book}
        lang={lang}
        bDir={bDir}
        readingMinutes={readingMinutes}
        similarHref={tubeCreateAnonymCta(lang, 'book_top_cta')}
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

      <PostReadConversion
        book={book}
        lang={lang}
        t={t}
        entryPath={bookPath}
        hasRelated={Boolean(related?.length)}
      />

      {related?.length ? (
        <section className="related" id="related-books">
          <h2>{t('bookPage.related')}</h2>
          <LibraryGrid books={related} lang={lang} t={t} />
        </section>
      ) : null}
    </main>
  );
}
