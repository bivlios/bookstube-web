// Server-rendered prev/next links (crawlable, no client JS).
export default function Pagination({ total, skip, limit, base, topic, bookLang }) {
  const mk = (s) => {
    const p = new URLSearchParams();
    if (topic) p.set('topic', topic);
    if (bookLang) p.set('bookLang', bookLang);
    if (s) p.set('skip', String(s));
    const q = p.toString();
    return q ? `${base}?${q}` : base;
  };

  const prev = skip > 0 ? Math.max(0, skip - limit) : null;
  const next = skip + limit < total ? skip + limit : null;
  if (prev === null && next === null) return null;

  const page = Math.floor(skip / limit) + 1;
  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <nav className="pager" aria-label="Pagination">
      {prev !== null ? <a href={mk(prev)} className="pager-btn" rel="prev">‹</a> : <span className="pager-btn pager-disabled">‹</span>}
      <span className="pager-info">{page} / {pages}</span>
      {next !== null ? <a href={mk(next)} className="pager-btn" rel="next">›</a> : <span className="pager-btn pager-disabled">›</span>}
    </nav>
  );
}
