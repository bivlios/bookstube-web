import { topicsIn } from '@/lib/topics';

// Topic filters as real links (?topic=tag) — crawlable, server-rendered, no client
// JS. Used on collection (taglib) pages to filter within that library, so chips
// keep the in-library ?topic= URLs (the standalone topic landing pages are linked
// from the home cards instead). `availableTags` hides topics the library doesn't
// have; without it (older API) all topics show.
export default function TopicChips({ t, active, basePath, availableTags }) {
  const topics = topicsIn(availableTags);
  if (!topics.length) return null;

  return (
    <nav className="topics" aria-label={t('bookstubeHome.exploreByTopic')}>
      <a href={basePath} className={`chip ${!active ? 'chip-active' : ''}`}>
        {t('bookstubeHome.allTopics')}
      </a>
      {topics.map(({ key, tag }) => (
        <a
          key={tag}
          href={`${basePath}?topic=${encodeURIComponent(tag)}`}
          className={`chip ${active === tag ? 'chip-active' : ''}`}
        >
          {t(`bookstubeHome.${key}`)}
        </a>
      ))}
    </nav>
  );
}
