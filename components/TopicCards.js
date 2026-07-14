import { topicsIn } from '@/lib/topics';

// Visual "Explore by topic" cards (emoji + label). Each links to its topic landing
// page (/[lang]/topics/[tag]) — the canonical, copy-bearing URL for the topic.
// `availableTags` (whole-library tag facet from the API) hides topics with no
// books; when the API doesn't send it yet, all topics show.
export default function TopicCards({ t, lang, active, availableTags }) {
  const topics = topicsIn(availableTags);
  if (!topics.length) return null;

  return (
    <section id="topics" className="topics-section">
      <h2 className="section-title">{t('bookstubeHome.exploreByTopic')}</h2>
      <nav className="topic-cards" aria-label={t('bookstubeHome.exploreByTopic')}>
        {topics.map(({ key, tag, emoji }) => (
          <a
            key={tag}
            href={`/${lang}/topics/${tag}`}
            className={`topic-card ${active === tag ? 'topic-card-active' : ''}`}
          >
            <span className="topic-emoji" aria-hidden="true">{emoji || '📚'}</span>
            <span className="topic-name">{t(`bookstubeHome.${key}`)}</span>
          </a>
        ))}
      </nav>
    </section>
  );
}
