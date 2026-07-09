import { TOPICS } from '@/lib/topics';

// Visual "Explore by topic" cards (emoji + label). Real ?topic= links — crawlable,
// server-rendered, no client JS. They act as topic landing pages that fill in as the
// API's topic tags get populated.
const EMOJI = {
  science: '🔬',
  history: '🏺',
  space: '🚀',
  technology: '💡',
  nature: '🌿',
  'social-story': '🤝',
  emotions: '❤️',
};

export default function TopicCards({ t, basePath, active, bookLang }) {
  const href = (tag) => {
    const p = new URLSearchParams();
    p.set('topic', tag);
    if (bookLang) p.set('bookLang', bookLang);
    return `${basePath}?${p.toString()}`;
  };

  return (
    <section id="topics" className="topics-section">
      <h2 className="section-title">{t('bookstubeHome.exploreByTopic')}</h2>
      <nav className="topic-cards" aria-label={t('bookstubeHome.exploreByTopic')}>
        {TOPICS.map(({ key, tag }) => (
          <a
            key={tag}
            href={href(tag)}
            className={`topic-card ${active === tag ? 'topic-card-active' : ''}`}
          >
            <span className="topic-emoji" aria-hidden="true">{EMOJI[tag] || '📚'}</span>
            <span className="topic-name">{t(`bookstubeHome.${key}`)}</span>
          </a>
        ))}
      </nav>
    </section>
  );
}
