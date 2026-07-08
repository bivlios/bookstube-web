import { getLibrary } from '@/lib/api';
import { makeT, dir } from '@/lib/i18n';
import { topicKey } from '@/lib/topics';
import { OG_IMAGE } from '@/lib/cta';
import TopicChips from '@/components/TopicChips';
import LibraryGrid from '@/components/LibraryGrid';
import Pagination from '@/components/Pagination';
import Cta from '@/components/Cta';

export const revalidate = 300;
const LIMIT = 24;

export async function generateMetadata({ params }) {
  const t = makeT(params.lang);
  const data = await getLibrary({ lib: params.tagid, limit: 1 }).catch(() => null);
  const libTitle = data?.library?.title;
  const title = libTitle ? `${libTitle} — BooksTube` : t('meta.bookstubeTitle');
  const description = t('meta.bookstubeDesc');
  return {
    title,
    description,
    alternates: { canonical: `/${params.lang}/taglib/${params.tagid}` },
    openGraph: { title, description, type: 'website', images: [OG_IMAGE] },
  };
}

export default async function TagLibrary({ params, searchParams }) {
  const { lang, tagid } = params;
  const t = makeT(lang);
  const topic = searchParams?.topic || undefined;
  const skip = Number(searchParams?.skip) || 0;

  const data = (await getLibrary({ lib: tagid, lang, topic, skip, limit: LIMIT })) || {
    books: [],
    total: 0,
    library: null,
  };

  const base = `/${lang}/taglib/${tagid}`;
  const heading = topic
    ? t(`bookstubeHome.${topicKey(topic) || ''}`)
    : data.library?.title || t('bookstubeHome.popularBooks');

  return (
    <main dir={dir(lang)}>
      <TopicChips t={t} active={topic} basePath={base} />
      <section id="library" className="library">
        <h1 className="section-title">{heading}</h1>
        {data.books.length ? (
          <>
            <LibraryGrid books={data.books} lang={lang} t={t} />
            <Pagination total={data.total} skip={skip} limit={LIMIT} base={base} topic={topic} />
          </>
        ) : (
          <p className="empty">{t('groups.noBooks')}</p>
        )}
      </section>
      <Cta t={t} />
    </main>
  );
}
