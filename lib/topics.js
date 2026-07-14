// "Explore by topic" chips → book tags filtered server-side by the read API.
// Books must carry the matching tag (today only 'social-story' is populated).
// `lib`: which TagLibraries collection the topic's landing page queries — topic
// tags live on books that must also belong to a library, and e.g. social stories
// are only in the social library, not the default one. Omit for the default.
export const TOPICS = [
  { key: 'topicScience', tag: 'science', emoji: '🔬' },
  { key: 'topicHistory', tag: 'history', emoji: '🏺' },
  { key: 'topicSpace', tag: 'space', emoji: '🚀' },
  { key: 'topicTechnology', tag: 'technology', emoji: '💡' },
  { key: 'topicNature', tag: 'nature', emoji: '🌿' },
  { key: 'topicSocial', tag: 'social-story', emoji: '🤝', lib: 'QtHLzJNMGymvXbwQA' },
  { key: 'topicEmotions', tag: 'emotions', emoji: '❤️' },
];

export const topicKey = (tag) => (TOPICS.find((t) => t.tag === tag) || {}).key;

export const topicByTag = (tag) => TOPICS.find((t) => t.tag === tag) || null;

// Topics worth showing given a library's real tag set; undefined/null availableTags
// (older API) means "unknown" → show everything.
export const topicsIn = (availableTags) =>
  Array.isArray(availableTags) ? TOPICS.filter((t) => availableTags.includes(t.tag)) : TOPICS;
