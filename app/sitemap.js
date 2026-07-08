import { getBooksIndex } from '@/lib/api';
import { LOCALES } from '@/lib/i18n';
import { SITE_URL } from '@/lib/cta';

export const revalidate = 3600;

export default async function sitemap() {
  const data = await getBooksIndex({ limit: 5000 }).catch(() => ({ books: [] }));
  const books = data?.books || [];
  const now = new Date();

  const home = LOCALES.map((l) => ({
    url: `${SITE_URL}/${l}`,
    lastModified: now,
    changeFrequency: 'daily',
  }));

  const bookUrls = books.map((b) => ({
    url: `${SITE_URL}/${b.orig_language || 'he'}/books/${encodeURIComponent(b.slug || b.bookId)}`,
    lastModified: b.updatedAt ? new Date(b.updatedAt) : now,
    changeFrequency: 'monthly',
  }));

  return [...home, ...bookUrls];
}
