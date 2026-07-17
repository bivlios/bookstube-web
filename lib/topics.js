import { libBySlug, libTagsParam, DEFAULT_POOL_TAGS } from './libraries';

// "Explore by topic" chips → book tags filtered server-side by the read API.
// Books must carry the matching tag (today only 'social-story' is populated).
// `lib`: which curated collection (lib/libraries.js entry, by id or slug) the
// topic's landing page queries — topic tags live on books that must also belong
// to a collection, and e.g. social stories are only in the social collection,
// not the default pool. Omit for the default pool.
export const TOPICS = [
  { key: 'topicScience', tag: 'science', emoji: '🔬' },
  { key: 'topicHistory', tag: 'history', emoji: '🏺' },
  { key: 'topicSpace', tag: 'space', emoji: '🚀' },
  { key: 'topicTechnology', tag: 'technology', emoji: '💡' },
  { key: 'topicNature', tag: 'nature', emoji: '🌿' },
  { key: 'topicSocial', tag: 'social-story', emoji: '🤝', lib: 'QtHLzJNMGymvXbwQA' },
  { key: 'topicEmotions', tag: 'emotions', emoji: '❤️' },
];

// The collection params a topic's books are drawn from: `tags` for the new API,
// `lib` riding along for the pre-tags API (see lib/api.js callers).
export const topicPool = (topic) => ({
  lib: topic.lib,
  tags: (topic.lib ? libTagsParam(libBySlug(topic.lib)) : DEFAULT_POOL_TAGS) || undefined,
});

export const topicKey = (tag) => (TOPICS.find((t) => t.tag === tag) || {}).key;

export const topicByTag = (tag) => TOPICS.find((t) => t.tag === tag) || null;

// Topics worth showing given a library's real tag set; undefined/null availableTags
// (older API) means "unknown" → show everything.
export const topicsIn = (availableTags) =>
  Array.isArray(availableTags) ? TOPICS.filter((t) => availableTags.includes(t.tag)) : TOPICS;
