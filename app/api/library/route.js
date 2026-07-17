import { getLibrary } from '@/lib/api';

// Same-origin JSON endpoint for the animated paginator (AnimatedLibrary). It just
// proxies the ISR-cached read API so the browser can fetch the next/prev page of books
// without a full navigation. The crawlable ?skip= links still point at the real pages.
export const revalidate = 300;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const opts = {};
  ['lib', 'tags', 'match', 'lang', 'topic', 'bookLang', 'skip', 'limit'].forEach((k) => {
    const v = searchParams.get(k);
    if (v) opts[k] = v;
  });
  const data = await getLibrary(opts).catch(() => null);
  return Response.json(data || { books: [], total: 0 });
}
