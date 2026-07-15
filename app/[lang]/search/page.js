import { searchBooks, getLibrary } from '@/lib/api';
import { makeT, dir } from '@/lib/i18n';
import { libBySlug, libName, libSlug } from '@/lib/libraries';
import BookCard from '@/components/BookCard';
import Cta from '@/components/Cta';

// Search results — server-rendered. Primary path is the read API's /search endpoint
// (title, translated title, author, tags, summary; most-viewed first), scoped to the
// library the visitor was browsing (hidden `lib` field in the header form). Until
// that endpoint is deployed (it 404s → null), fall back to fetching the library's
// newest pages and filtering here — same fields, capped at FALLBACK_PAGES pages.
// noindex: query pages shouldn't compete with the canonical library/book pages.
const LIMIT = 60;
const FALLBACK_PAGES = 8; // ×60 = 480 newest books — covers the whole library today

const fallbackSearch = async (lib, q) => {
  const needle = q.toLowerCase();
  const fetched = [];
  let total = Infinity;
  for (let skip = 0; skip < FALLBACK_PAGES * LIMIT && skip < total; skip += LIMIT) {
    const page = await getLibrary({ lib, skip, limit: LIMIT }).catch(() => null);
    if (!page || !page.books?.length) break;
    total = page.total || 0;
    fetched.push(...page.books);
  }
  const match = (b) =>
    [b.title, b.translated_title, b.author?.name, b.summery, ...(b.tags || [])]
      .filter(Boolean)
      .some((s) => String(s).toLowerCase().includes(needle));
  const books = fetched.filter(match);
  return { total: books.length, books: books.slice(0, LIMIT) };
};

export async function generateMetadata({ params, searchParams }) {
  const t = makeT(params.lang);
  const q = (searchParams?.q || '').trim();
  const title = q ? `${t('tagLibrary.searchTitle')}: ${q}` : t('tagLibrary.searchTitle');
  return { title, robots: { index: false } };
}

export default async function SearchPage({ params, searchParams }) {
  const { lang } = params;
  const t = makeT(lang);
  const q = (searchParams?.q || '').trim();

  // The header form sends the taglib URL slug; the API wants the TagLibraries id.
  const libEntry = searchParams?.lib ? libBySlug(searchParams.lib) : null;
  const libId = libEntry?.id || searchParams?.lib || undefined;

  let data = null;
  if (q.length >= 2) {
    data = await searchBooks({ q, lib: libId, limit: LIMIT }).catch(() => null);
    if (!data) data = await fallbackSearch(libId, q).catch(() => null);
  }
  const books = data?.books || [];
  const scopeName = libEntry ? libName(libEntry, lang) : null;
  // Clear-search target: back to the library the search was scoped to (or home).
  const backHref = libEntry ? `/${lang}/taglib/${libSlug(libEntry)}` : `/${lang}`;

  return (
    <main dir={dir(lang)}>
      <section id="library" className="library">
        <h1 className="section-title">
          {t('tagLibrary.searchTitle')}{q ? `: «${q}»` : ''}
          {scopeName ? <span className="lib-count">{scopeName}</span> : null}
          {data?.total ? <span className="lib-count">{data.total} {t('tagLibrary.books')}</span> : null}
        </h1>
        <p className="search-clear">
          <a href={backHref} className="chip">✕ {t('bookPage.backToLibrary')}</a>
        </p>
        {books.length ? (
          <div className="grid">
            {books.map((b) => (
              <BookCard key={b.bookId} book={b} lang={lang} t={t} />
            ))}
          </div>
        ) : (
          <p className="empty">{t('tagLibrary.searchNoResults')}</p>
        )}
      </section>
      <Cta t={t} lang={lang} />
    </main>
  );
}
