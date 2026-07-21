# bookstube-web

Public frontend for **bookstube.ai** — a free library of children's books written by kids on Books Giant.

## The goal: organic traffic

This site exists to attract organic search traffic; the hope is it grows into many readers over time. Every change must preserve the SEO-friendly structure that drives this:

- Server-rendered pages with **real crawlable links** (`<a href>`, plain GET forms) — never client-only navigation for content.
- **Minimal client JS**: client components only where interactivity truly demands it (reader, share button, view ping, header search scoping). Content and lists stay in server components.
- Canonical URLs + hreflang alternates per language, JSON-LD `Book` schema on book pages, sitemap generated from the books index. Query/tool pages (`/search`, `/[lang]/create`) are `noindex`.
- The **full story text is server-rendered** on book detail pages (visually collapsed) so books can rank for their content.

## Architecture

- Next.js App Router (plain JS, no TS) on Vercel. Languages: `he` (default) / `en` / `ar` / `de`, routed as `/[lang]/…`.
- **All data** comes from the read-only JSON API at `library.booksgiant.com/api/bookstube/*`, served by the Meteor app in `../books-giant-school-2026` (`imports/startup/server/bookstube-api.js` → `imports/api/books/server/bookstube-read.js`). Fetches are ISR-cached (`lib/api.js`).
- The only write is the fire-and-forget view counter: `POST /api/bookstube/view/:bookId` (`components/ViewPing.js`).
- The curated library list (pills/switcher) is hardcoded in `lib/libraries.js` — edit + push, no DB. Each entry's `tags` array defines its CONTENT (passed to the API as a `tags` param — no TagLibraries doc needed on the Books Giant side; the legacy `lib` id param still rides along for back-compat and legacy /taglib/<id> URLs). Tags match ANY by default; `match: 'all'` (that exact string — anything else, or omitting the field, is ANY) on an entry requires EVERY tag (e.g. `['social-story','lang:ar']` → only Arabic social stories). `LIBRARY_ORDER` maps each site language to the collections it shows and their pill order, and its FIRST entry is that language's home — its books fill `/[lang]` (different languages can have different homes). A collection absent from a language's list gets no pill/sitemap entry there and its URL is noindexed in that language; a collection's /taglib/ page canonicalizes to `/[lang]` in the language it is home for.
- Book covers that are missing on S3 get a generated SVG placeholder (`components/CoverImage.js`).
- **Home masthead** (`components/Hero.js`): header + hero render as one dark-purple band, colors
  from the video poster's own palette (navy/blue-violet/magenta, see `.hero-band` in `globals.css`).
  `LibrarySwitcher` renders separately, directly above the `.library` grid on every page (home and
  inner) — CSS (`.lib-switch + .library`) joins the two into one visual panel with no gap.
- **Book creator embed** (`tube.booksgiant.com/create-anonym`): only ever iframed on its own
  `/[lang]/create` page, never inline on content pages — the embedded app auto-focuses an input
  on load, and browsers scroll cross-origin iframes into view on focus, which was a jarring jump
  when it lived in the footer CTA. Content pages (`components/Cta.js`) link to `/create` instead.

## Admin & content ops

No login here. Tag curation and TTS narration happen on **school.booksgiant.com/taglib** (admin pencil icon on each card) in the school project. Content changes appear here within the ISR window (~5 min).

## Deploy

- This repo: `git push` → Vercel auto-deploys.
- API changes: Galaxy deploy of the school project (`npm run deploy` there).
