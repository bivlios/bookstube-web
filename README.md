# bookstube-web

The public **bookstube.ai** free children's-book library — a Next.js (App Router) frontend
that reads from the Books Giant Phase-0 API and iframes the existing Meteor viewer.

See the migration plan in the main repo: `docs/bookstube-vercel-migration.md`.

## Architecture

```
bookstube.ai (this app, Vercel)
  ├── SSR + ISR pages, SEO, i18n, analytics
  ├── data  → GET https://library.booksgiant.com/api/bookstube/*   (read-only)
  └── reader → iframe https://library.booksgiant.com/sample-book/:id (Meteor viewer + TTS)
```

No database access, no auth, no writes. Everything comes from the read API.

## Getting started

```bash
cp .env.example .env.local     # then edit values
npm install
npm run dev                    # http://localhost:3000  → redirects to /he
```

Until `library.booksgiant.com` DNS is live, point the API at the school host:

```
BOOKSTUBE_API_BASE=https://school.booksgiant.com/api/bookstube
```

## Routes

| Path | Page |
|---|---|
| `/` | → redirects to `/{locale}` (Accept-Language, default `he`) |
| `/[lang]` | Library home — hero, topic chips, popular grid, conversion CTA |
| `/[lang]/books/[slug]` | Book detail — cover, facts, summary, crawlable text, JSON-LD, "Read now" iframe |
| `/[lang]/taglib/[tagid]` | A curated collection |
| `/sitemap.xml`, `/robots.txt` | Generated from the API |

Locales: `he`, `en`, `ar`, `de` (RTL for he/ar). Strings live in `lib/locales/*.json`
(ported from the Meteor repo — keep in sync when copy changes).

## Structure

```
app/
  [lang]/
    layout.js            root layout (<html lang dir>, header, footer)
    page.js              library home
    books/[slug]/page.js book detail
    taglib/[tagid]/page.js curated collection
    not-found.js
  sitemap.js  robots.js  globals.css
components/               Hero, TopicChips, LibraryGrid, BookCard, Pagination,
                         Cta, Header, LangSwitcher, ReaderButton(client)
lib/                      api.js, i18n.js, topics.js, cta.js, locales/
middleware.js            locale-prefix redirect
```

## Deploy (Vercel)

1. Push to a new GitHub repo, import in Vercel.
2. Set env vars from `.env.example` (`BOOKSTUBE_API_BASE`, `NEXT_PUBLIC_SITE_URL`,
   optional `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_FB_PIXEL_ID`).
3. Add the `bookstube.ai` domain in Vercel and point DNS once you're ready to cut over
   (keep the Meteor `isLibraryDomain` branch as instant rollback — see the migration doc).

## Not yet done (post-scaffold)

- Analytics wiring (GA4 + pixel env vars are read but no script tag yet).
- Search (the API has no search endpoint; the old client-side search wasn't ported).
- Native player (Phase 5) — currently the reader is the iframed Meteor viewer.
- `hreflang` is emitted for the home pages; extend to detail pages if you add translated URLs.
