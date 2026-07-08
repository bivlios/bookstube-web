// "Explore by topic" chips → book tags filtered server-side by the read API.
// Books must carry the matching tag (today only 'social-story' is populated).
export const TOPICS = [
  { key: 'topicScience', tag: 'science' },
  { key: 'topicHistory', tag: 'history' },
  { key: 'topicSpace', tag: 'space' },
  { key: 'topicTechnology', tag: 'technology' },
  { key: 'topicNature', tag: 'nature' },
  { key: 'topicSocial', tag: 'social-story' },
  { key: 'topicEmotions', tag: 'emotions' },
];

export const topicKey = (tag) => (TOPICS.find((t) => t.tag === tag) || {}).key;
