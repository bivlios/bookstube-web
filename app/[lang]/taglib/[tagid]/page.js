import { getLibrary } from '@/lib/api';
import { makeT, dir, LOCALES, isBookLanguage } from '@/lib/i18n';
import { topicKey } from '@/lib/topics';
import { libBySlug, libName, libSlug, libIntro, libInLang, libParams, isHomeLib } from '@/lib/libraries';
import { OG_IMAGE } from '@/lib/cta';
import LibrarySwitcher from '@/components/LibrarySwitcher';
import TopicChips from '@/components/TopicChips';
import AnimatedLibrary from '@/components/AnimatedLibrary';
import Cta from '@/components/Cta';
import MakeBookBanner from '@/components/MakeBookBanner';

export const revalidate = 300;
const LIMIT = 60; // up to six shelves of 10 per page (see BookShelf / PER_SHELF)

export async function generateMetadata({ params }) {
  const t = makeT(params.lang);
  const lib = libBySlug(params.tagid);
  const libId = lib?.id || params.tagid;
  const canonicalSeg = lib ? libSlug(lib) : params.tagid;
  const data = await getLibrary({ ...libParams(lib), lib: libId, limit: 1 }).catch(() => null);
  const libTitle = (lib && libName(lib, params.lang)) || data?.library?.title;
  const title = libTitle ? `${libTitle} — BooksTube` : t('meta.bookstubeTitle');
  const description = (lib && libIntro(lib, params.lang)) || t('meta.bookstubeDesc');
  return {
    title,
    description,
    // A collection that is this language's home duplicates "/" — canonicalize there.
    alternates: {
      canonical: lib && isHomeLib(lib, params.lang)
        ? `/${params.lang}`
        : `/${params.lang}/taglib/${canonicalSeg}`,
    },
    openGraph: { title, description, type: 'website', images: [OG_IMAGE] },
    // A collection viewed in a language it isn't scoped to (lib.langs) still renders
    // for direct links, but shouldn't be indexed — it's unlinked and unsitemapped.
    ...(lib && !libInLang(lib, params.lang) ? { robots: { index: false, follow: true } } : null),
  };
}

export default async function TagLibrary({ params, searchParams }) {
  const { lang, tagid } = params;
  const t = makeT(lang);
  const topic = searchParams?.topic || undefined;
  const bookLang = isBookLanguage(searchParams?.bookLang)
    ? searchParams.bookLang.toLowerCase()
    : undefined;
  const skip = Number(searchParams?.skip) || 0;

  // The URL segment is a friendly slug (legacy raw ids still resolve). Curated entries
  // carry their own `tags` (the API needs no TagLibraries doc); unknown segments fall
  // back to a raw `lib` id lookup so legacy /taglib/<id> links keep working.
  const lib = libBySlug(tagid);
  const libId = lib?.id || tagid;
  const slug = lib ? libSlug(lib) : tagid;
  const coll = { ...libParams(lib), lib: libId };

  const [pageData, unfilteredLanguageData] = await Promise.all([
    getLibrary({ ...coll, lang, topic, bookLang, skip, limit: LIMIT }),
    bookLang
      ? getLibrary({ ...coll, lang, topic, skip: 0, limit: LIMIT }).catch(() => null)
      : Promise.resolve(null),
  ]);
  const data = pageData || {
    books: [],
    total: 0,
    library: null,
  };
  const languageData = unfilteredLanguageData || data;

  const base = `/${lang}/taglib/${slug}`;
  const heading = topic
    ? t(`bookstubeHome.${topicKey(topic) || ''}`)
    : (lib && libName(lib, lang)) || data.library?.title || t('bookstubeHome.popularBooks');

  return (
    <main dir={dir(lang)}>
      <TopicChips t={t} active={topic} basePath={base} availableTags={data.availableTags} />
      <MakeBookBanner lang={lang} t={t} />
      <LibrarySwitcher lang={lang} active={slug} t={t}
                       basePath={base} bookLang={bookLang} topic={topic}
                       availableLangs={languageData.availableLangs}
                       books={languageData.books} />
      <section id="library" className="library">
        <h1 className="section-title">
          {heading}
          {data.total ? <span className="lib-count">{data.total} {t('tagLibrary.books')}</span> : null}
        </h1>
        {!topic && lib && libIntro(lib, lang) ? (
          <p className="topic-intro">{libIntro(lib, lang)}</p>
        ) : null}
        {data.books.length ? (
          <AnimatedLibrary
            lang={lang}
            lib={libId}
            tags={coll.tags}
            match={coll.match}
            topic={topic}
            bookLang={bookLang}
            initialBooks={data.books}
            total={data.total}
            limit={LIMIT}
            initialSkip={skip}
            basePath={base}
          />
        ) : (
          <p className="empty">{t('groups.noBooks')}</p>
        )}
      </section>
      <Cta t={t} lang={lang} />
    </main>
  );
}
