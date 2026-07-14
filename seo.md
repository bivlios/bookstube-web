# SEO roadmap for bookstube.ai

Goal (see CLAUDE.md): attract organic search traffic. This file tracks the SEO
recommendations and their status. Data reality check (2026-07): the default
library has 444 books but almost none carry topic tags; only the Social Stories
library (11 books) is topically coherent. Tagging books (admin pencil on
school.booksgiant.com/taglib) is what unlocks most of the items below.

## 1. Own the "social stories" niche — HIGHEST PRIORITY
Parents of autistic children, special-ed teachers and therapists search for very
specific scenarios ("social story about going to the dentist"). Competition is
weak, searchers are motivated, and we already have a dedicated library.
- [x] Topic landing page `/[lang]/topics/social-story` with intro copy (reads from
      the Social Stories library).
- [x] Intro copy + meta description on the `/taglib/social` collection page.
- [ ] Content: write/tag more social stories, one per common scenario (dentist,
      haircut, new sibling, first flight…). Each story = one long-tail query.
- [ ] Name scenarios explicitly in book titles/summaries (searchable words).

## 2. Real topic landing pages (programmatic SEO)
- [x] `/[lang]/topics/[topic]` routes — intro paragraph per topic per language,
      canonical + hreflang, books grid. Empty topics render but are `noindex`
      until books get tagged, so no thin pages are published.
- [x] Home topic cards link to the topic pages (real URLs instead of `?topic=`).
- [x] `?topic=` filtered views set canonical → the topic page.
- [x] Sitemap includes only topic pages that have books.
- [ ] Age pages `/[lang]/ages/[n]` — BLOCKED: zero books carry `age:N` tags
      today. Revisit once ages are tagged (the API already supports it via
      `topic=age:N`).

## 3. Only show what exists (UX + crawl quality)
- [x] Topic pills/cards hidden when the library has no books with that tag
      (uses `availableTags` from the API; falls back to showing all until the
      backend deploy).
- [x] Language filter shows only languages that actually exist in the library.
- [x] Backend: `/library` returns whole-library `availableLangs` + `availableTags`
      via Mongo distinct (in repo `books-giant-school-2026`, ships with next
      Galaxy deploy).

## 4. Structured data
- [x] `Book` JSON-LD: added `typicalAgeRange` (from age tags) and
      `accessibilityFeature: readAloud` for narrated books.
- [ ] Consider `AggregateRating` if ratings are ever added.

## 5. Sitemap & indexing
- [x] Collection (taglib) pages added to the sitemap (they were missing).
- [ ] Verify the site in Google Search Console, submit the sitemap, and watch
      which queries almost rank — that decides which topic pages to build next.
- [ ] Bing Webmaster Tools (free, and feeds DuckDuckGo/others).

## 6. Backlinks & distribution (not code)
- [ ] Embeddable book/library widget for school websites ("Powered by BooksTube"
      link) — the Meteor app already has `widg-book`; package + promote it.
      Every school embed = a permanent backlink.
- [ ] Proud-family loop: teacher "share class books with parents" links; the
      book share button (done) is step one.
- [ ] Pinterest boards of covers (visual, teacher-heavy audience); SEN/homeschool
      communities for the social-stories pages.

## 7. Performance (Core Web Vitals)
- [ ] Serve covers via `next/image` or at least width/height + preload for the
      featured book (S3 covers are unoptimized today). CLS is already contained
      by aspect-ratio boxes.

## 8. Content depth (needs product decision)
- [ ] AI-generated "Parent & Teacher guide" per book (discussion questions,
      vocabulary, values) — unique indexable text on every book page; the admin
      AI-summary pipeline can be reused. Generate once, store on the book.
- [ ] Auto-translated book pages would multiply indexable pages ×4 — decide on
      quality bar first.
