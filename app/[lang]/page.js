import { getLibrary, getBook } from '@/lib/api';
import { makeT, dir, LOCALES } from '@/lib/i18n';
import { topicKey, topicByTag } from '@/lib/topics';
import { libNameById, FEATURED_BOOKS, HOME_LIB_ID, HOME_LIB_TAGS } from '@/lib/libraries';
import { OG_IMAGE } from '@/lib/cta';
import Hero from '@/components/Hero';
import LibrarySwitcher from '@/components/LibrarySwitcher';
import TopicCards from '@/components/TopicCards';
import LangFilter from '@/components/LangFilter';
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
  const bookLang = LOCALES.includes(searchParams?.bookLang) ? searchParams.bookLang : undefined;
  const skip = Number(searchParams?.skip) || 0;

  // `tags` defines the collection content-side; `lib` rides along so the currently
  // deployed API (which predates the tags param) keeps working until the Galaxy deploy.
  const homeColl = { lib: HOME_LIB_ID, tags: HOME_LIB_TAGS || undefined };
  const data = (await getLibrary({ ...homeColl, lang, topic, bookLang, skip, limit: LIMIT })) || {
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
        {/* While a language filter is active the facet reflects the filtered set,
            so only pass it on the unfiltered view — pills must not vanish mid-use. */}
        <LangFilter t={t} active={bookLang} basePath={`/${lang}`} topic={topic}
                    availableLangs={bookLang ? undefined : data.availableLangs} />
        <TopicCards t={t} lang={lang} active={topic} availableTags={data.availableTags} />
        <MakeBookBanner lang={lang} t={t} />
        <LibrarySwitcher lang={lang} activeId={HOME_LIB_ID} t={t} />
        <section id="library" className="library">
          <h2 className="section-title">
            {heading}
            {data.total ? <span className="lib-count">{data.total} {t('tagLibrary.books')}</span> : null}
          </h2>
          {data.books.length ? (
            <AnimatedLibrary
              lang={lang}
              lib={HOME_LIB_ID}
              tags={HOME_LIB_TAGS}
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

  // Featured: try the curated FEATURED_BOOKS list first (lib/libraries.js), in order,
  // preferring an entry whose orig_language matches the visitor's language; falls back
  // to the first resolving entry, then to the old heuristic (first same-language book
  // with a summary) if the list is empty or every entry has gone stale.
  let featured = null;
  let firstResolvedFeatured = null;
  for (const idOrSlug of FEATURED_BOOKS) {
    const candidate = await getBook(idOrSlug, { seo: 1 }).catch(() => null);
    if (!candidate) continue;
    if (!firstResolvedFeatured) firstResolvedFeatured = candidate;
    if (candidate.book?.orig_language === lang) { featured = candidate; break; }
  }
  featured = featured || firstResolvedFeatured;

  if (!featured) {
    const pick = primary.find((b) => b.summery) || data.books.find((b) => b.summery) || data.books[0];
    featured = pick ? await getBook(pick.slug || pick.bookId, { seo: 1 }).catch(() => null) : null;
  }

  return (
    <main dir={dir(lang)}>
      <Hero t={t} lang={lang} />
      <LangFilter t={t} basePath={`/${lang}`} availableLangs={data.availableLangs} />
      {featured ? <FeaturedBook data={featured} lang={lang} t={t} /> : null}
      <TopicCards t={t} lang={lang} availableTags={data.availableTags} />
      <MakeBookBanner lang={lang} t={t} />
      <LibrarySwitcher lang={lang} activeId={HOME_LIB_ID} t={t} />

      <section id="library" className="library">
        <h2 className="section-title">
          {libNameById(HOME_LIB_ID, lang)}
          {primaryTotal ? <span className="lib-count">{primaryTotal} {t('tagLibrary.books')}</span> : null}
        </h2>
        {primary.length ? (
          <AnimatedLibrary
            lang={lang}
            lib={HOME_LIB_ID}
            tags={HOME_LIB_TAGS}
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
