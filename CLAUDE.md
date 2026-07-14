# bookstube-web

Public frontend for **bookstube.ai** — a free library of children's books written by kids on Books Giant.

## The goal: organic traffic

This site exists to attract organic search traffic; the hope is it grows into many readers over time. Every change must preserve the SEO-friendly structure that drives this:

- Server-rendered pages with **real crawlable links** (`<a href>`, plain GET forms) — never client-only navigation for content.
- **Minimal client JS**: client components only where interactivity truly demands it (reader, share button, view ping, header search scoping). Content and lists stay in server components.
- Canonical URLs + hreflang alternates per language, JSON-LD `Book` schema on book pages, sitemap generated from the books index. Query pages (e.g. `/search`) are `noindex`.
- The **full story text is server-rendered** on book detail pages (visually collapsed) so books can rank for their content.

## Architecture

- Next.js App Router (plain JS, no TS) on Vercel. Languages: `he` (default) / `en` / `ar` / `de`, routed as `/[lang]/…`.
- **All data** comes from the read-only JSON API at `library.booksgiant.com/api/bookstube/*`, served by the Meteor app in `../books-giant-school-2026` (`imports/startup/server/bookstube-api.js` → `imports/api/books/server/bookstube-read.js`). Fetches are ISR-cached (`lib/api.js`).
- The only write is the fire-and-forget view counter: `POST /api/bookstube/view/:bookId` (`components/ViewPing.js`).
- The curated library list (pills/switcher) is hardcoded in `lib/libraries.js` — edit + push, no DB.
- Book covers that are missing on S3 get a generated SVG placeholder (`components/CoverImage.js`).

## Admin & content ops

No login here. Tag curation and TTS narration happen on **school.booksgiant.com/taglib** (admin pencil icon on each card) in the school project. Content changes appear here within the ISR window (~5 min).

## Deploy

- This repo: `git push` → Vercel auto-deploys.
- API changes: Galaxy deploy of the school project (`npm run deploy` there).
