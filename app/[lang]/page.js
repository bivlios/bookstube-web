import { getLibrary } from '@/lib/api';
import { makeT, dir, LOCALES } from '@/lib/i18n';
import { topicKey } from '@/lib/topics';
import { OG_IMAGE } from '@/lib/cta';
import Hero from '@/components/Hero';
import LibrarySwitcher from '@/components/LibrarySwitcher';
import TopicChips from '@/components/TopicChips';
import LibraryGrid from '@/components/LibraryGrid';
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
  const skip = Number(searchParams?.skip) || 0;

  const data = (await getLibrary({ lang, topic, skip, limit: LIMIT })) || {
    books: [],
    total: 0,
  };

  const heading = topic
    ? t(`bookstubeHome.${topicKey(topic) || ''}`)
    : t('bookstubeHome.popularBooks');

  return (
    <main dir={dir(lang)}>
      <LibrarySwitcher lang={lang} activeId="bookstube" />
      <Hero t={t} />
      <TopicChips t={t} active={topic} basePath={`/${lang}`} />
      <section id="library" className="library">
        <h2 className="section-title">{heading}</h2>
        {data.books.length ? (
          <>
            <LibraryGrid books={data.books} lang={lang} t={t} />
            <Pagination total={data.total} skip={skip} limit={LIMIT} base={`/${lang}`} topic={topic} />
          </>
        ) : (
          <p className="empty">{t('groups.noBooks')}</p>
        )}
      </section>
      <Cta t={t} />
    </main>
  );
}
