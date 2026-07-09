import { getLibrary, getBook } from '@/lib/api';
import { makeT, dir, LOCALES } from '@/lib/i18n';
import { topicKey } from '@/lib/topics';
import { OG_IMAGE } from '@/lib/cta';
import Hero from '@/components/Hero';
import LibrarySwitcher from '@/components/LibrarySwitcher';
import TopicCards from '@/components/TopicCards';
import LangFilter from '@/components/LangFilter';
import FeaturedBook from '@/components/FeaturedBook';
import LibraryGrid from '@/components/LibraryGrid';
import ParentValue from '@/components/ParentValue';
import Pagination from '@/components/Pagination';
import Cta from '@/components/Cta';

export const revalidate = 300;
const LIMIT = 24;

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
          <h2 className="section-title">{heading}</h2>
          {data.books.length ? (
            <>
              <LibraryGrid books={data.books} lang={lang} t={t} />
              <Pagination
                total={data.total}
                skip={skip}
                limit={LIMIT}
                base={`/${lang}`}
                topic={topic}
                bookLang={bookLang}
              />
            </>
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
  const others = data.books.filter((b) => b.orig_language !== lang);
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
        <h2 className="section-title">{t('bookstubeHome.shelfPopular')}</h2>
        {primary.length ? (
          <>
            <LibraryGrid books={primary} lang={lang} t={t} />
            <Pagination total={data.total} skip={skip} limit={LIMIT} base={`/${lang}`} />
          </>
        ) : (
          <p className="empty">{t('groups.noBooks')}</p>
        )}
      </section>

      {inLang.length && others.length ? (
        <section className="library">
          <h2 className="section-title">{t('bookstubeHome.otherLanguages')}</h2>
          <LibraryGrid books={others} lang={lang} t={t} />
        </section>
      ) : null}

      <ParentValue t={t} />
      <Cta t={t} />
    </main>
  );
}
