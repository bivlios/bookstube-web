import { getLibrary, getBook } from '@/lib/api';
import { makeT, dir, LOCALES, isBookLanguage } from '@/lib/i18n';
import { topicKey, topicByTag } from '@/lib/topics';
import {
  libName, libSlug, libIntro, libParams, homeLibFor, featuredFor, DEFAULT_POOL_TAGS,
} from '@/lib/libraries';
import { OG_IMAGE } from '@/lib/cta';
import Hero from '@/components/Hero';
import LibrarySwitcher from '@/components/LibrarySwitcher';
import TopicCards from '@/components/TopicCards';
import FeaturedBook from '@/components/FeaturedBook';
import AnimatedLibrary from '@/components/AnimatedLibrary';
import ParentValue from '@/components/ParentValue';
import Cta from '@/components/Cta';
import MakeBookBanner from '@/components/MakeBookBanner';

export const revalidate = 300;
const LIMIT = 60; // up to six shelves of 10 per page (see BookShelf / PER_SHELF)

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params, searchParams }) {
  const t = makeT(params.lang);
  const title = t('meta.bookstubeTitle');
  const description = t('meta.bookstubeDesc');
  // ?topic= filtered views duplicate the topic landing pages — canonicalize there.
  const topic = topicByTag(searchParams?.topic || '');
  return {
    title,
    description,
    alternates: {
      canonical: topic ? `/${params.lang}/topics/${topic.tag}` : `/${params.lang}`,
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
  const bookLang = isBookLanguage(searchParams?.bookLang)
    ? searchParams.bookLang.toLowerCase()
    : undefined;
  const skip = Number(searchParams?.skip) || 0;

  // This language's home collection (first entry of its LIBRARY_ORDER). `tags`
  // defines the content; `lib` rides along so the currently deployed API (which
  // predates the tags param) keeps working until the Galaxy deploy.
  const homeLib = homeLibFor(lang);
  const homeColl = libParams(homeLib);
  const [pageData, unfilteredLanguageData] = await Promise.all([
    getLibrary({ ...homeColl, lang, topic, bookLang, skip, limit: LIMIT }),
    bookLang
      ? getLibrary({ ...homeColl, lang, topic, skip: 0, limit: LIMIT }).catch(() => null)
      : Promise.resolve(null),
  ]);
  const data = pageData || {
    books: [],
    total: 0,
  };
  const languageData = unfilteredLanguageData || data;

  // Filtered view (topic and/or language): the API filters + paginates server-side,
  // so we just render the returned page as a single crawlable grid.
  if (topic || bookLang) {
    const heading = topic
      ? t(`bookstubeHome.${topicKey(topic) || ''}`)
      : t(`bookstubeHome.booksIn_${bookLang}`);
    return (
      <main dir={dir(lang)}>
        <TopicCards t={t} lang={lang} active={topic} availableTags={data.availableTags} />
        <MakeBookBanner lang={lang} t={t} />
        <LibrarySwitcher lang={lang} active={libSlug(homeLib)} t={t}
                         basePath={`/${lang}`} bookLang={bookLang} topic={topic}
                         availableLangs={languageData.availableLangs}
                         books={languageData.books} />
        <section id="library" className="library">
          <h2 className="section-title">
            {heading}
            {data.total ? <span className="lib-count">{data.total} {t('tagLibrary.books')}</span> : null}
          </h2>
          {data.books.length ? (
            <AnimatedLibrary
              lang={lang}
              lib={homeColl.lib}
              tags={homeColl.tags}
              match={homeColl.match}
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
        <Cta t={t} lang={lang} />
      </main>
    );
  }

  // Home view: prioritize books whose original language matches the UI language. This is
  // a dedicated server-side filtered fetch (not a client-side split of the mixed `data`
  // page above) so a full LIMIT of same-language books fills the grid, instead of whatever
  // fraction of one mixed page happened to match.
  const langData = await getLibrary({ ...homeColl, lang, bookLang: lang, skip, limit: LIMIT }).catch(() => null);
  // Require at least a full shelf's worth before preferring the language-filtered set —
  // a couple of stray matches would otherwise starve the grid down to a near-empty page.
  const hasLangBooks = (langData?.books?.length || 0) >= 10;
  const primary = hasLangBooks ? langData.books : data.books;
  const primaryTotal = hasLangBooks ? langData.total : data.total;

  // Featured: a recommendation must always match the site's interface language.
  // Try this home collection's curated picks first, but never fall back to a curated
  // book in another language. If none match, pick a same-language book from the home
  // collection, then from the broader BooksTube catalog.
  let featured = null;
  for (const idOrSlug of featuredFor(lang)) {
    const candidate = await getBook(idOrSlug, { seo: 1 }).catch(() => null);
    if (candidate?.book?.orig_language === lang) { featured = candidate; break; }
  }

  if (!featured) {
    const homeLanguageBooks = (langData?.books || data.books || [])
      .filter((book) => book.orig_language === lang);
    let pick = homeLanguageBooks.find((book) => book.summery) || homeLanguageBooks[0];

    if (!pick) {
      const catalogLanguageData = await getLibrary({
        tags: DEFAULT_POOL_TAGS,
        bookLang: lang,
        limit: LIMIT,
      }).catch(() => null);
      const catalogBooks = (catalogLanguageData?.books || [])
        .filter((book) => book.orig_language === lang);
      pick = catalogBooks.find((book) => book.summery) || catalogBooks[0];
    }

    const candidate = pick
      ? await getBook(pick.slug || pick.bookId, { seo: 1 }).catch(() => null)
      : null;
    featured = candidate?.book?.orig_language === lang ? candidate : null;
  }

  return (
    <main dir={dir(lang)}>
      <Hero t={t} lang={lang} />
      {featured ? <FeaturedBook data={featured} lang={lang} t={t} /> : null}
      <TopicCards t={t} lang={lang} availableTags={data.availableTags} />
      <MakeBookBanner lang={lang} t={t} />
      <LibrarySwitcher lang={lang} active={libSlug(homeLib)} t={t}
                       basePath={`/${lang}`} availableLangs={data.availableLangs}
                       books={data.books} />

      <section id="library" className="library">
        <h2 className="section-title">
          {libName(homeLib, lang)}
          {primaryTotal ? <span className="lib-count">{primaryTotal} {t('tagLibrary.books')}</span> : null}
        </h2>
        {/* The home collection's intro (lib/libraries.js) — the home page serves that
            collection's books, so its SEO copy must show here too, not only on the
            /taglib/ page (which canonicalizes here when the collection is home). */}
        {libIntro(homeLib, lang) ? <p className="topic-intro">{libIntro(homeLib, lang)}</p> : null}
        {primary.length ? (
          <AnimatedLibrary
            lang={lang}
            lib={homeColl.lib}
            tags={homeColl.tags}
            match={homeColl.match}
            prioritizeLang
            initialBooks={primary}
            total={primaryTotal}
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
      <Cta t={t} lang={lang} />
    </main>
  );
}
