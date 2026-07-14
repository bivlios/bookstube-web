import { notFound } from 'next/navigation';
import { getLibrary } from '@/lib/api';
import { makeT, dir, LOCALES } from '@/lib/i18n';
import { topicByTag } from '@/lib/topics';
import { OG_IMAGE } from '@/lib/cta';
import AnimatedLibrary from '@/components/AnimatedLibrary';
import MakeBookBanner from '@/components/MakeBookBanner';
import Cta from '@/components/Cta';

// Topic landing pages (/[lang]/topics/space …) — the canonical, copy-bearing URL
// for each "Explore by topic" entry. Books come from the topic's home library
// (see TOPICS[].lib) filtered by the topic tag. Pages with no books still render
// (they populate automatically as books get tagged via the admin pencil) but are
// noindex until then, so thin pages never reach the index.
export const revalidate = 300;
const LIMIT = 60;

const fetchTopic = (topic, opts = {}) =>
  getLibrary({ lib: topic.lib, topic: topic.tag, ...opts }).catch(() => null);

export async function generateMetadata({ params }) {
  const topic = topicByTag(decodeURIComponent(params.topic));
  if (!topic) return {};
  const t = makeT(params.lang);
  const title = `${t(`bookstubeHome.${topic.key}`)} — BooksTube`;
  const description = t(`topicIntro.${topic.tag}`);
  const path = (l) => `/${l}/topics/${topic.tag}`;
  const data = await fetchTopic(topic, { limit: 1 });
  return {
    title,
    description,
    alternates: {
      canonical: path(params.lang),
      languages: Object.fromEntries(LOCALES.map((l) => [l, path(l)])),
    },
    openGraph: { title, description, url: path(params.lang), type: 'website', images: [OG_IMAGE] },
    ...(data?.total ? {} : { robots: { index: false } }),
  };
}

export default async function TopicPage({ params, searchParams }) {
  const { lang } = params;
  const topic = topicByTag(decodeURIComponent(params.topic));
  if (!topic) notFound();

  const t = makeT(lang);
  const skip = Number(searchParams?.skip) || 0;
  const data = (await fetchTopic(topic, { lang, skip, limit: LIMIT })) || { books: [], total: 0 };
  const basePath = `/${lang}/topics/${topic.tag}`;

  return (
    <main dir={dir(lang)}>
      <section id="library" className="library">
        <h1 className="section-title">
          <span aria-hidden="true">{topic.emoji}</span> {t(`bookstubeHome.${topic.key}`)}
          {data.total ? <span className="lib-count">{data.total} {t('tagLibrary.books')}</span> : null}
        </h1>
        <p className="topic-intro">{t(`topicIntro.${topic.tag}`)}</p>
        {data.books.length ? (
          <AnimatedLibrary
            lang={lang}
            lib={topic.lib}
            topic={topic.tag}
            initialBooks={data.books}
            total={data.total}
            limit={LIMIT}
            initialSkip={skip}
            basePath={basePath}
          />
        ) : (
          <p className="empty">{t('groups.noBooks')}</p>
        )}
      </section>
      <MakeBookBanner lang={lang} t={t} />
      <Cta t={t} />
    </main>
  );
}
