import { getBooksIndex, getLibrary } from '@/lib/api';
import { LOCALES } from '@/lib/i18n';
import { SITE_URL } from '@/lib/cta';
import { LIBRARIES, libSlug, libInLang, DEFAULT_POOL_TAGS } from '@/lib/libraries';
import { TOPICS, topicPool } from '@/lib/topics';

export const revalidate = 3600;

export default async function sitemap() {
  const data = await getBooksIndex({ tags: DEFAULT_POOL_TAGS, limit: 5000 }).catch(() => ({ books: [] }));
  const books = data?.books || [];
  const now = new Date();

  const home = LOCALES.map((l) => ({
    url: `${SITE_URL}/${l}`,
    lastModified: now,
    changeFrequency: 'daily',
  }));

  // Curated collection pages (per language — they render localized headings/copy).
  // Only the languages each collection is scoped to (lib.langs); the rest are noindex.
  const collections = LIBRARIES.filter((lib) => !lib.home).flatMap((lib) =>
    LOCALES.filter((l) => libInLang(lib, l)).map((l) => ({
      url: `${SITE_URL}/${l}/taglib/${libSlug(lib)}`,
      lastModified: now,
      changeFrequency: 'weekly',
    }))
  );

  // Topic landing pages — only ones that actually have books (empty ones are
  // noindex, so listing them would just send crawlers to pages we exclude).
  const topicCounts = await Promise.all(
    TOPICS.map((tp) =>
      getLibrary({ ...topicPool(tp), topic: tp.tag, limit: 1 })
        .then((d) => ({ tp, total: d?.total || 0 }))
        .catch(() => ({ tp, total: 0 }))
    )
  );
  const topics = topicCounts
    .filter(({ total }) => total > 0)
    .flatMap(({ tp }) =>
      LOCALES.map((l) => ({
        url: `${SITE_URL}/${l}/topics/${tp.tag}`,
        lastModified: now,
        changeFrequency: 'weekly',
      }))
    );

  const bookUrls = books.map((b) => ({
    url: `${SITE_URL}/${b.orig_language || 'he'}/books/${encodeURIComponent(b.slug || b.bookId)}`,
    lastModified: b.updatedAt ? new Date(b.updatedAt) : now,
    changeFrequency: 'monthly',
  }));

  return [...home, ...collections, ...topics, ...bookUrls];
}
