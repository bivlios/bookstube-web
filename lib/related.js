import { TOPICS } from './topics';

// Tags used only for storage, rendering, or broad collection membership should
// not make two books "related". Language and age are handled separately below.
const FUNCTIONAL_TAGS = new Set([
  'ai',
  'educational',
  'tube',
  'guest',
  'images',
  'bookstube',
  'publiclib',
  'popular',
]);
const TOPIC_TAGS = new Set(TOPICS.map((topic) => topic.tag));

const normalizeTag = (tag) => String(tag || '').trim();

const isMeaningfulTag = (tag) => {
  const normalized = normalizeTag(tag);
  const lower = normalized.toLowerCase();
  if (!normalized || FUNCTIONAL_TAGS.has(lower)) return false;
  if (/^(?:lang|lng|age):/i.test(normalized)) return false;
  // School/group ids and full prompt sentences are metadata, not subjects.
  if (/^[a-z0-9]{15,}$/i.test(normalized)) return false;
  if (normalized.length > 48 || /[?!]/.test(normalized)) return false;
  return true;
};

const meaningfulTags = (book) =>
  [...new Set((book?.tags || []).map(normalizeTag).filter(isMeaningfulTag))];

// Put the site's curated subject tags first so the API's ANY-tags query is most
// likely to return topical matches before falling back to broader attributes.
export const relatedQueryTags = (book) => {
  const tags = meaningfulTags(book);
  return [
    ...tags.filter((tag) => TOPIC_TAGS.has(tag)),
    ...tags.filter((tag) => !TOPIC_TAGS.has(tag)),
  ].slice(0, 8);
};

const ageTag = (book) => {
  const raw = (book?.tags || []).find((tag) => /^age:\d+$/i.test(String(tag)));
  return raw ? Number(String(raw).split(':')[1]) : null;
};

const authorName = (book) => String(book?.author?.name || '').trim().toLowerCase();

const stableHash = (value) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  }
  return hash >>> 0;
};

const relatedScore = (book, candidate) => {
  const sourceTags = new Set(meaningfulTags(book));
  const sharedTags = meaningfulTags(candidate).filter((tag) => sourceTags.has(tag));
  const sharedTopics = sharedTags.filter((tag) => TOPIC_TAGS.has(tag)).length;
  let score = sharedTopics * 100 + sharedTags.length * 20;

  const sourceAuthor = authorName(book);
  if (sourceAuthor && sourceAuthor === authorName(candidate)) score += 10;

  const sourceAge = ageTag(book);
  const candidateAge = ageTag(candidate);
  if (sourceAge != null && candidateAge != null) {
    score += Math.max(0, 6 - Math.abs(sourceAge - candidateAge));
  }

  return score;
};

// The API returns candidates in a popularity/latest order. A per-book stable hash
// breaks equal-score ties so unrelated fallback results do not repeat identically
// on every detail page, while keeping SSR output deterministic.
export const rankRelatedBooks = (book, candidates, limit = 8) => {
  const currentId = book?.bookId;
  const currentSlug = book?.slug;
  const unique = new Map();

  (candidates || []).forEach((candidate) => {
    if (!candidate?.bookId) return;
    if (candidate.bookId === currentId || (currentSlug && candidate.slug === currentSlug)) return;
    if (candidate.orig_language !== book?.orig_language) return;
    unique.set(candidate.bookId, candidate);
  });

  return [...unique.values()]
    .map((candidate) => ({
      candidate,
      score: relatedScore(book, candidate),
      tie: stableHash(`${currentId || currentSlug || ''}:${candidate.bookId}`),
    }))
    .sort((a, b) => b.score - a.score || a.tie - b.tie)
    .slice(0, limit)
    .map(({ candidate }) => candidate);
};
