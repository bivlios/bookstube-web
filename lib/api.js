// Thin client for the Books Giant read API (Phase 0). All calls are GET + ISR-cached.
const API_BASE =
  process.env.BOOKSTUBE_API_BASE || 'https://library.booksgiant.com/api/bookstube';

const qs = (obj = {}) => {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : '';
};

async function apiGet(path, revalidate) {
  const res = await fetch(`${API_BASE}${path}`, { next: { revalidate } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`bookstube API ${res.status} for ${path}`);
  return res.json();
}

export const getLibraries = () => apiGet('/libraries', 600);

export const getLibrary = (opts = {}) => apiGet(`/library${qs(opts)}`, 300);

export const getBook = (slugOrId, opts = {}) =>
  apiGet(`/book/${encodeURIComponent(slugOrId)}${qs(opts)}`, 600);

export const getBooksIndex = (opts = {}) => apiGet(`/books-index${qs(opts)}`, 3600);

export const searchBooks = (opts = {}) => apiGet(`/search${qs(opts)}`, 300);

// Absolute URL for the client-side view-counter ping (POST, fire-and-forget).
export const viewPingUrl = (bookId) => `${API_BASE}/view/${encodeURIComponent(bookId)}`;
