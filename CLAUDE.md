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
- The curated library list (pills/switcher) is hardcoded in `lib/libraries.js` — edit + push, no DB. `LIBRARY_ORDER` there maps each site language to the collections it shows and their pill order; a collection absent from a language's list gets no pill/sitemap entry there and its URL is noindexed in that language.
- Book covers that are missing on S3 get a generated SVG placeholder (`components/CoverImage.js`).
- **Home masthead** (`components/Hero.js`): header, hero and the library switcher render as one
  continuous dark-purple band — `LibrarySwitcher` takes `variant="hero"` to render as the band's
  transparent bottom row instead of the sticky bar used on inner pages. Colors are the video
  poster's own palette (navy/blue-violet/magenta, see `.hero-band` in `globals.css`).
- **Book creator embed** (`tube.booksgiant.com/create-anonym`): only ever iframed on its own
  `/[lang]/create` page, never inline on content pages — the embedded app auto-focuses an input
  on load, and browsers scroll cross-origin iframes into view on focus, which was a jarring jump
  when it lived in the footer CTA. Content pages (`components/Cta.js`) link to `/create` instead.

## Admin & content ops

No login here. Tag curation and TTS narration happen on **school.booksgiant.com/taglib** (admin pencil icon on each card) in the school project. Content changes appear here within the ISR window (~5 min).

## Deploy

- This repo: `git push` → Vercel auto-deploys.
- API changes: Galaxy deploy of the school project (`npm run deploy` there).
