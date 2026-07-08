import { TOPICS } from '@/lib/topics';

// Topic filters as real links (?topic=tag) — crawlable, server-rendered, no client JS.
export default function TopicChips({ t, active, basePath }) {
  return (
    <nav className="topics" aria-label={t('bookstubeHome.exploreByTopic')}>
      <a href={basePath} className={`chip ${!active ? 'chip-active' : ''}`}>
        {t('bookstubeHome.allTopics')}
      </a>
      {TOPICS.map(({ key, tag }) => (
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
