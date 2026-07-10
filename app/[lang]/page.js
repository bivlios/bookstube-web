import { getLibrary, getBook } from '@/lib/api';
import { makeT, dir, LOCALES } from '@/lib/i18n';
import { topicKey } from '@/lib/topics';
import { OG_IMAGE } from '@/lib/cta';
import Hero from '@/components/Hero';
import LibrarySwitcher from '@/components/LibrarySwitcher';
import TopicCards from '@/components/TopicCards';
import LangFilter from '@/components/LangFilter';
import FeaturedBook from '@/components/FeaturedBook';
import AnimatedLibrary from '@/components/AnimatedLibrary';
import ParentValue from '@/components/ParentValue';
import Cta from '@/components/Cta';

export const revalidate = 300;
const LIMIT = 20; // two full shelves of 10 per page (see BookShelf / PER_SHELF)

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }) {
  const t = makeT(params.lang);
  const title = t('meta.bookstubeTitle');
  const description = t('meta.bookstubeDesc');
  return {
    title,
    description,
    alternates: {
      canonical: `/${params.lang}`,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])),
    },
    openGraph: { title, description, url: `/${params.lang}`, type: 'website', images: [OG_IMAGE] },
    twitter: { card: 'summary_large_image', title, description, images: [OG_IMAGE] },
  };
}

export default async function LibraryHome({ params, searchParams }) {
  const { lang } = params;
  const t = makeT(lang);
  const topic = searchParams?.topic || undefined;
  const bookLang = LOCALES.includes(searchParams?.bookLang) ? searchParams.bookLang : undefined;
  const skip = Number(searchParams?.skip) || 0;

  const data = (await getLibrary({ lang, topic, bookLang, skip, limit: LIMIT })) || {
    books: [],
    total: 0,
  };

  // Filtered view (topic and/or language): the API filters + paginates server-side,
  // so we just render the returned page as a single crawlable grid.
  if (topic || bookLang) {
    const heading = topic
      ? t(`bookstubeHome.${topicKey(topic) || ''}`)
      : t(`bookstubeHome.booksIn_${bookLang}`);
    return (
      <main dir={dir(lang)}>
        <LibrarySwitcher lang={lang} activeId="bookstube" />
        <LangFilter t={t} active={bookLang} basePath={`/${lang}`} topic={topic} />
        <TopicCards t={t} basePath={`/${lang}`} active={topic} bookLang={bookLang} />
        <section id="library" className="library">
          <h2 className="section-title">
            {heading}
            {data.total ? <span className="lib-count">{data.total} {t('tagLibrary.books')}</span> : null}
          </h2>
          {data.books.length ? (
            <AnimatedLibrary
              lang={lang}
              topic={topic}
              bookLang={bookLang}
              initialBooks={data.books}
              total={data.total}
              limit={LIMIT}
              initialSkip={skip}
              basePath={`/${lang}`}
            />
          ) : (
            <p className="empty">{t('groups.noBooks')}</p>
          )}
        </section>
        <Cta t={t} />
      </main>
    );
  }

  // Home view: prioritize books whose original language matches the UI language.
  // (The API doesn't filter by language, so we split the returned page here.)
  const inLang = data.books.filter((b) => b.orig_language === lang);
  const primary = inLang.length ? inLang : data.books;

  // Featured: prefer a same-language book with a summary; fetch its detail for facts.
  const pick =
    inLang.find((b) => b.summery) || data.books.find((b) => b.summery) || data.books[0];
  const featured = pick
    ? await getBook(pick.slug || pick.bookId, { seo: 1 }).catch(() => null)
    : null;

  const covers = data.books.slice(0, 6).map((b) => b.coverUrl);

  return (
    <main dir={dir(lang)}>
      <LibrarySwitcher lang={lang} activeId="bookstube" />
      <Hero t={t} covers={covers} />
      <LangFilter t={t} basePath={`/${lang}`} />
      {featured ? <FeaturedBook data={featured} lang={lang} t={t} /> : null}
      <TopicCards t={t} basePath={`/${lang}`} />

      <section id="library" className="library">
        <h2 className="section-title">
          {t('bookstubeHome.shelfPopular')}
          {data.total ? <span className="lib-count">{data.total} {t('tagLibrary.books')}</span> : null}
        </h2>
        {primary.length ? (
          <AnimatedLibrary
            lang={lang}
            prioritizeLang
            initialBooks={primary}
            total={data.total}
            limit={LIMIT}
            initialSkip={skip}
            basePath={`/${lang}`}
          />
        ) : (
          <p className="empty">{t('groups.noBooks')}</p>
        )}
      </section>

      {/* "Other languages" shelf hidden for now — it wasn't clear alongside the
          client-paginated popular grid. Revisit later. */}

      <ParentValue t={t} />
      <Cta t={t} />
    </main>
  );
}
