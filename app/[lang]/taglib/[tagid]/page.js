import { getLibrary } from '@/lib/api';
import { makeT, dir } from '@/lib/i18n';
import { topicKey } from '@/lib/topics';
import { libBySlug, libName, libSlug } from '@/lib/libraries';
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
  const data = await getLibrary({ lib: libId, limit: 1 }).catch(() => null);
  const libTitle = (lib && libName(lib, params.lang)) || data?.library?.title;
  const title = libTitle ? `${libTitle} — BooksTube` : t('meta.bookstubeTitle');
  const description = t('meta.bookstubeDesc');
  return {
    title,
    description,
    alternates: { canonical: `/${params.lang}/taglib/${canonicalSeg}` },
    openGraph: { title, description, type: 'website', images: [OG_IMAGE] },
  };
}

export default async function TagLibrary({ params, searchParams }) {
  const { lang, tagid } = params;
  const t = makeT(lang);
  const topic = searchParams?.topic || undefined;
  const skip = Number(searchParams?.skip) || 0;

  // The URL segment is a friendly slug (legacy raw ids still resolve); the read API wants
  // the real TagLibraries._id. URLs keep the slug, everything data-facing uses the id.
  const lib = libBySlug(tagid);
  const libId = lib?.id || tagid;
  const slug = lib ? libSlug(lib) : tagid;

  const data = (await getLibrary({ lib: libId, lang, topic, skip, limit: LIMIT })) || {
    books: [],
    total: 0,
    library: null,
  };

  const base = `/${lang}/taglib/${slug}`;
  const heading = topic
    ? t(`bookstubeHome.${topicKey(topic) || ''}`)
    : (lib && libName(lib, lang)) || data.library?.title || t('bookstubeHome.popularBooks');

  return (
    <main dir={dir(lang)}>
      <LibrarySwitcher lang={lang} activeId={libId} t={t} />
      <TopicChips t={t} active={topic} basePath={base} />
      <MakeBookBanner lang={lang} t={t} />
      <section id="library" className="library">
        <h1 className="section-title">
          {heading}
          {data.total ? <span className="lib-count">{data.total} {t('tagLibrary.books')}</span> : null}
        </h1>
        {data.books.length ? (
          <AnimatedLibrary
            lang={lang}
            lib={libId}
            topic={topic}
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
      <Cta t={t} />
    </main>
  );
}
