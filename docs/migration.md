> **Canonical source:** this is a snapshot copied from the Books Giant (Meteor) repo at
> `docs/bookstube-vercel-migration.md`. Edit the canonical there for big planning changes,
> then re-copy. This copy exists so work in *this* repo has the full plan (a separate Claude
> Code session here has no access to the Meteor repo's memory or docs). Snapshot: 2026-07-08.

# bookstube.ai → Vercel migration plan

**Status (July 2026):** Phase 0 deployed + verified in prod. Phase 1 Next.js app live on Vercel
(github.com/bivlios/bookstube-web) — library, book detail, taglib, SEO, i18n, GA4, config-driven
library switcher, reader login-hidden. Batch-publish admin tool built (`/utils`). Phase 5 native
player **built (v1)** — react-pageflip over published JPEGs + API `reader` block — committed but
**not yet deployed/pushed**; activates after Meteor deploy + publishing books + `bookstube-web` push.

Phase 1 repo lives at `../bookstube-web` (sibling to this Meteor repo) — Next.js 14 App Router,
plain JS, no MUI/next-intl. Builds clean; verified against prod API: SSR library + book-detail
pages, real `<a>` book links, per-page metadata + canonical + hreflang(4) + OG + JSON-LD Book,
crawlable story text, sitemap.xml/robots.txt, RTL for he/ar, locale-prefix middleware, topic-filter
links, pagination, iframe reader button. Not yet: analytics script tags, search, native player.

Living document. Architecture decisions below are settled; the Phase-0 read-API contract is
drafted (see "Read API contract" below) and pending review before implementation. See
`docs/bookstube.md` for the *current* in-Meteor implementation this migrates away from.

---

## Why separate

bookstube.ai is a fundamentally different product from the school app: a **read-only, anonymous,
public children's book library** whose entire value is SEO discoverability and fast reading.
Today it's served by the same Meteor/Galaxy monolith via `appStore.isLibraryDomain()` host
branching. That coupling causes real pain:

- Any bookstube change = full Galaxy deploy of the school app (slow, risky).
- Meteor's client-rendered SPA + hand-injected SSR strings is a poor fit for a content site;
  Next.js does SEO (ISR, metadata, JSON-LD, sitemap, hreflang) natively and far better.
- Meteor keeps a DDP websocket + oplog per client — the worst workload for anonymous public
  read traffic. Vercel serverless + CDN serves it cheaply and scales.

**Business flow (unchanged):** read a book free → love the format → want a personalized version
→ create on tube.booksgiant.com.

---

## Decisions locked

| Decision | Choice | Notes |
|---|---|---|
| Data layer | **API-first** (Next → HTTPS read API on Meteor → Galaxy Mongo) | NOT direct DB connect. Reasons below. |
| Reader + API host | **`library.booksgiant.com`** (existing Galaxy custom domain the user owns) | Both the read API and the iframed `/sample-book` viewer are served from this one Galaxy host. `noindex` the whole host so it never competes with the Vercel pages. |
| Reader (v1) | iframe `library.booksgiant.com/sample-book/:id` | Existing Meteor viewer, unchanged. |
| Reader player | Iframe the existing Meteor viewer; **rebuild native later** | Player rewrite (from published JPEGs) is Phase 5, not v1. |
| TTS | **Free in v1** — lives inside the iframed viewer (Gemini/Google) | `TTS_PROVIDER: gemini`. No separate Next TTS route needed until native player. |
| Marketing | **New GA4 property + new FB pixel**, own env vars on Next | Fully independent of the Meteor `marketing-tracking.js` / CAPI plumbing. Client pixel only for v1; CAPI later if wanted. |
| Writes from Next | **None** in v1 | Slugs pre-backfilled once; view counts deferred. Meteor owns all writes + schema. |

---

## Why NOT connect Vercel directly to the DB

DB is **Galaxy-hosted MongoDB** (`*.eu-mongodb.galaxy-cloud.io`, db `mtebooks`, replica set
`y63e512e4a1c`, `authSource=admin`, **no `ssl=true`**, `maxPoolSize=20`). It's credential-gated
with no IP allowlist, so Vercel *could* reach it — but shouldn't in v1:

1. **Security scope.** `mtebooks` is the *entire* production DB (users, emails, billing, MOE
   tokens). The app credential reads all of it. A collection-scoped read-only user would need
   admin user-creation rights on Galaxy Mongo, which the hosted plan may not grant.
2. **Connection limits.** App pool is only 20. Serverless spawns many concurrent instances →
   can exhaust Galaxy's connection cap and **destabilize the live school app**.
3. **No TLS** — plaintext transport over the public internet (SCRAM keeps creds hashed, but
   payloads are unencrypted).

API-first avoids all three: Meteor keeps its existing pool, Next just makes cacheable HTTP
calls, and only public book fields ever leave the server.

**Direct-connect stays the Phase-5 option** (full decouple) — gated on being able to create a
collection-scoped read-only Mongo user on Galaxy (open a support ticket to confirm).

---

## Target architecture (v1)

```
                bookstube.ai  (Vercel — new Next.js repo)
                ┌───────────────────────────────────────────┐
                │  Homepage / library / detail / topics      │  ← all crawlable HTML, ISR-cached
                │  SEO (metadata, JSON-LD, sitemap, hreflang)│
                │  i18n (he/en/ar/de, RTL)                   │
                │  own GA4 + FB pixel                         │
                └──────────────┬───────────────┬─────────────┘
                   HTTPS JSON  │               │ iframe (Read now)
                               ▼               ▼
                 Galaxy  (library.booksgiant.com — noindex)
        ┌───────────────────────────────┐   ┌──────────────────────────────┐
        │ Read API: /api/bookstube/*     │   │ /sample-book/:id viewer       │
        │ (reuses existing method logic) │   │ (Fabric player + TTS, as-is)  │
        └──────────────┬────────────────┘   └──────────────────────────────┘
                       ▼
              Galaxy Mongo  (mtebooks)  — writes + schema stay here
```

**Next/Vercel owns:** every public HTML page, SEO, i18n, homepage sections, library grid,
detail pages, topic filters, CTAs to tube.booksgiant.com, analytics. (≈90% of iteration — now
deploy-independent.)

**Galaxy still owns** (served on `library.booksgiant.com`): the read API, the iframe reader
(incl. TTS), all writes, the school/tube app.

---

## Phased plan

**Phase 0 — Read API + reader host (Galaxy, one deploy) — IMPLEMENTED (pending deploy)**

Code:
- `imports/api/books/server/bookstube-read.js` — read-only data layer (mirrors
  `getBooksByTagId` / `bookstube.getBookDetail`, school context stripped, contract shapes,
  ported FUNCTIONAL_TAGS + age logic, batched slug backfill).
- `imports/startup/server/bookstube-api.js` — connect routes at `/api/bookstube/*`
  (CORS to bookstube.ai + `*.vercel.app` + localhost, per-endpoint `s-maxage`, OPTIONS/405/404/500).
  Wired in `imports/startup/server/index.js`.
- `imports/startup/server/robots.js` — `library.booksgiant.com` now serves `Disallow: /` and an
  `X-Robots-Tag: noindex, nofollow` header on every response for that host.
- Framing already permitted (`BrowserPolicy.framing.allowAll()` in `browser-policy.js`), so
  bookstube.ai can embed `/sample-book` — no change needed.

Ops / still to do:
- Point `library.booksgiant.com` DNS at the Galaxy app + add it as a Galaxy custom domain (user
  confirmed the host is clean / safe to noindex).
- Deploy. Then **backfill all slugs once** by hitting `…/api/bookstube/books-index?limit=5000`
  (the endpoint backfills as a side effect), or the existing bookstube.ai `sitemap.xml`.
- → API contract implemented — see "Read API contract" below.

Post-deploy smoke test (against `library.booksgiant.com`, or any Galaxy host):
```
curl -s '<host>/api/bookstube/libraries' | jq
curl -s '<host>/api/bookstube/library?limit=3' | jq '.total, .books[0]'
curl -s '<host>/api/bookstube/library?topic=social-story&limit=3' | jq '.total'
curl -s '<host>/api/bookstube/book/<slug>?seo=1' | jq '.book.title, .readingMinutes, (.paragraphs|length)'
curl -sI 'library.booksgiant.com/anything' | grep -i x-robots-tag   # expect noindex
```

**Phase 1 — Next.js skeleton (Vercel, new repo)**
- App Router. Routes mirror today: `/`, `/[lang]`, `/[lang]/books/[slug]`, `/taglib/[id]`,
  `/sitemap.xml`, `/robots.txt`.
- Data via `fetch` to Phase-0 API; ISR (`revalidate`) on book/library pages.
- Port locale JSON (he/en/ar/de) → `next-intl` (proposed), RTL handling.

**Phase 2 — SEO parity (the point of the project)**
- Native `generateMetadata` (title/description/canonical/OG/Twitter), JSON-LD `Book`, `hreflang`,
  sitemap route. Port from `react-helmet-ssr.js` + `sitemap.js` (already string-builders). Verify
  against current live output + Google Rich Results before cutover.

**Phase 3 — Reader**
- "Read now" → fullscreen dialog with `<iframe src="https://library.booksgiant.com/sample-book/:id/:lang">`,
  language via URL param / `postMessage`. TTS included. Player rewrite deferred.

**Phase 4 — Cutover**
- Run Next on a preview host; verify SEO parity.
- Flip `bookstube.ai` DNS/custom domain Galaxy → Vercel.
- Keep the Meteor `isLibraryDomain` branch as **instant rollback** (repoint DNS).

**Phase 5 — Native player (full decouple)** — v1 BUILT (committed, not deployed/pushed)

**Built so far:**
- API (`bookstube-read.js`, committed `90f3eeda`): `/book/:slug` returns a `reader` block for
  `pages_published` books — `{published, pageCount, pageWidth, pageHeight, pageImages[]}`; images
  at the uniform public path `books/pages/{bookId}/{i}.jpeg` (publish meta omits `private`).
- Next (`bookstube-web`, committed `2c17a8d`, **not pushed**): `components/BookReader.js` —
  react-pageflip (StPageFlip) flipbook, lazy-imported on open (SSR-safe, small bundle);
  fullscreen dialog, keyboard, page counter, `onError` per page. Detail page picks BookReader when
  `book.reader.published`, else the iframe `ReaderButton`. Styles in `globals.css`.
- **RTL (he/ar): DONE.** StPageFlip has no native RTL mode, so `BookReader` reverses the page
  array before handing it to the engine (logical page 0 becomes the rightmost page) and opens at
  the reversed `startPage`; the book now opens/flips right-to-left with the cover on the right.
  Page numbers exposed to the reader (counter, keyboard, buttons) stay in natural 1..n order via a
  `toLogical()` remap. Verified in-browser against a real published Hebrew book — correct reading
  order, monotonic counter, LTR unaffected. (Technique ported from the `react-pageflip-rtl` fork,
  kept inline rather than added as a dependency — it's an unmaintained single-author package.)

**To activate:** (1) deploy the Meteor app (ships the `reader` block), (2) run the batch-publish
tool so books are `pages_published`, (3) `git push` `bookstube-web` → Vercel. Then published books
open the native flipbook; unpublished keep the iframe. Not visually flip-tested yet (needs a
published book + deployed API).

---

*Original plan / rationale (kept for reference):*

Goal: replace the iframed Meteor viewer with a native reader in `bookstube-web`, giving full
control and removing the last Meteor/cross-origin dependency for reading (and mooting the reader
login-leak). **Published books only.**

*Current reader (what we're replacing):* the live desktop viewer (`AnimatedBook`) uses
**turn.js (jQuery)** — `$('#flipbook').turn(...)`, driven by `book-control-bar.jsx`. Pages are
built by the Fabric `make-book.js` pipeline (canvas → HTML) with a `booksText` overlay. turn.js is
unmaintained (~10 yrs). `react-pageflip` is in `package.json` and referenced by `animated-book.js`,
but the import is **commented out** — an abandoned experiment, not live.

*Why the native player is simpler, not just newer:* a published book is a set of static JPEGs at
`books/pages/{bookId}/{i}.jpeg` **with the page text baked into the image**. So the native reader
drops Fabric, `make-book.js`, the `booksText` overlay, AND turn.js — it just renders `<img>` pages.
No jQuery.

**Flipbook lib:** use **`react-pageflip` (StPageFlip)** — modern, maintained, React-native, works
in Next as a client component (dynamic import, `ssr:false`). This is the intended replacement for
turn.js; do NOT port turn.js (jQuery) or use dflip/DearFlip (also jQuery). It's a *fresh* build in
Next over simple images, which is what keeps the risk low.

**Prerequisite (operational, gates everything):** publish the library books. Almost none are
`pages_published` today, so batch-run the existing `backgroundPublish` over the ~431 library books
first. This is also the load-speed win (static JPEGs from CDN). **Tool built:** `/utils` (admin) →
"Bookstube Batch Publish" — `bookstube.libraryPublishStatus` server method +
`imports/ui/components/admin/bookstube-batch-publish.jsx`; loads all library books and publishes
pages sequentially (one tab, resumable). TTS batch is stubbed for later (reuse `generateBookTTS`).

**Work involved:**
1. *API additions* (`bookstube-read.js`), for `pages_published` books: ordered `pageImages[]`
   (`books/pages/{bookId}/{i}.jpeg`), `pageCount` (from `creatorPages.pages`, non-deleted),
   `proportion`/aspect, and per-page **TTS audio URLs** (stored at `books/tts/{bookId}/{i}.{mp3|wav}`,
   mapped via the book's `ttsAudio` field). Read-only + cacheable. Only expose for published books.
2. *Next player component*: `react-pageflip` rendering the JPEGs — prev/next, page count,
   fullscreen, responsive sizing, and **RTL page order** for he/ar.
3. *TTS*: play the per-page audio URLs with `new Audio(url)`, auto-advance + page-turn sync (mirror
   `book-control-bar.jsx`). v1 = narrated books (pre-generated audio) only; later add a Next API
   route that generates on the fly via the Gemini/Google key (mirrors the server
   `convertGoogleTextToSpeech` method).
4. *Swap-in*: use the native player when `pages_published` (+ narration for TTS), else fall back to
   the current iframe. Nothing breaks during the transition; the Meteor turn.js viewer stays only
   as the fallback until every library book is published.

**Risk:** low–moderate. Low: images already published, `react-pageflip` is the modern standard and
the build is fresh (no jQuery port). Medium: RTL flip behavior, responsive sizing, TTS auto-read
parity, fullscreen. The real gating cost is operational (publishing the books), not code.

**Also at this phase (optional):** move reads to a scoped read-only DB user and retire the API
dependency; `library.booksgiant.com` then only serves the API, or is retired too.

---

## Read API contract (v1 draft)

**Base:** `https://library.booksgiant.com/api/bookstube` — all `GET`, JSON, read-only.
Implemented as Meteor `WebApp`/`Picker` connect routes reusing existing method logic
(`getBooksByTagId`, `bookstube.getBookDetail`, `getAppSettingsById`). Served from the same Galaxy
app that hosts the iframe viewer, so Next talks to a single Galaxy origin.

**Cross-cutting rules**
- **CORS:** `Access-Control-Allow-Origin: https://bookstube.ai` (+ preview host during migration).
- **Caching:** every response sends `Cache-Control: public, s-maxage=<ttl>, stale-while-revalidate=86400`
  so Vercel/CDN + Next ISR cache it. TTLs below.
- **Field naming:** JSON keeps the DB field names as-is (`translated_title`, `summery`,
  `orig_language`) to minimize transformation risk — **except** two *computed* fields the client
  should never construct itself: `coverUrl` and `readerUrl` (built server-side from
  `Meteor.settings.public.dataPath` and the Option-A viewer host).
- **Errors:** not-found / deleted → `404 {"error":"not_found"}`. Bad params → `400`.
- **Writes:** Next never writes. The one server-side write that remains is the lazy slug
  assignment inside the book endpoint — harmless because Phase 0 pre-backfills all slugs, so it
  effectively never fires. (It's the Meteor app writing, not Next.)

### Shared shape — `BookCard`
```jsonc
{
  "bookId": "abc123",
  "slug": "המצאת-האינטרנט",
  "title": "המצאת האינטרנט",
  "translated_title": "The Invention of the Internet",   // may be empty
  "author": { "name": "Dana L." },
  "orig_language": "he",
  "summery": "…",                                          // may be empty
  "views": 42,
  "tags": ["bookstube", "science", "age:8"],               // raw tags
  "coverUrl": "https://…/user-books/covers/abc123_tmb.jpeg"
}
```

### 1. `GET /library` — TTL 300s
Library grid + pagination (replaces `getBooksByTagId`, school data stripped).

| Param | Default | Meaning |
|---|---|---|
| `lib` | `bookstube` | `TagLibraries._id` |
| `bookLang` | — | filter by `orig_language` |
| `topic` | — | topic tag (`science`, `social-story`, …) → `{$in: libTags, $all:[topic]}` |
| `skip` | `0` | pagination offset |
| `limit` | `20` | page size |
| `sort` | `latest` | `latest` \| `views` |

```jsonc
{
  "library": { "id": "bookstube", "title": "BooksTube Library", "tags": ["bookstube"] },
  "total": 2431,
  "books": [ BookCard, … ],
  "availableLangs": ["he", "en", "ar"]   // distinct orig_language in this page (optional convenience)
}
```

### 2. `GET /book/:slugOrId` — TTL 600s
Detail page data (replaces `bookstube.getBookDetail`).

| Param | Default | Meaning |
|---|---|---|
| `fromTag` | `bookstube` | library id for "related" |
| `seo` | `0` | `1` → include `paragraphs` (full story text for crawlable HTML + JSON-LD description) |

```jsonc
{
  "book": {
    "bookId": "abc123",
    "slug": "המצאת-האינטרנט",
    "title": "…",
    "translated_title": "…",
    "summery": "…",
    "author": { "name": "Dana L." },
    "orig_language": "he",
    "tags": ["bookstube","science","age:8"],
    "topics": ["science"],                 // tags minus FUNCTIONAL_TAGS (reuse the set in bookstube-book.jsx)
    "age": { "min": 8, "max": 10 },        // from settings.age or `age:N` tag → N..N+2; null if absent
    "views": 42,
    "parentNote": "",                      // usually empty (roadmap field)
    "createdAt": "2026-05-01T…",
    "coverUrl": "https://…/user-books/covers/abc123_tmb.jpeg",
    "readerUrl": "https://library.booksgiant.com/sample-book/abc123"   // iframe src
  },
  "words": 320,
  "readingMinutes": 3,                     // Math.max(1, round(words/110))
  "related": [ BookCard, … ],              // same library, sort views desc, limit 8
  "paragraphs": ["…", "…"]                 // only when seo=1
}
```

### 3. `GET /libraries` — TTL 600s
Switcher entries for the library dropdown (from `AppSettings._id:'bookstube'.libraries`).
```jsonc
{ "libraries": [ { "id": "bookstube", "names": { "he":"…","en":"…","ar":"…","de":"…" } }, … ] }
```

### 4. `GET /books-index` — TTL 3600s
Lightweight list for the Next-generated `sitemap.xml`. Verify field choices against the existing
`imports/startup/server/sitemap.js` before finalizing (esp. whether translated-language URLs are
listed, or only `orig_language`).

| Param | Default | Meaning |
|---|---|---|
| `lib` | `bookstube` | which library to enumerate |
| `skip` / `limit` | `0` / `1000` | page through the full set |

```jsonc
{
  "total": 2431,
  "books": [ { "slug": "…", "bookId": "abc123", "orig_language": "he", "updatedAt": "…" }, … ]
}
```

### Notes for the Meteor-side implementation
- Reuse the existing query bodies; wrap them in connect routes that emit JSON + the headers above.
- `coverUrl` = `${Meteor.settings.public.dataPath}user-books/covers/${bookId}_tmb.jpeg`.
- `readerUrl` = `${VIEWER_HOST}/sample-book/${bookId}` (`VIEWER_HOST = https://library.booksgiant.com`).
- `topics` / `age`: port the `FUNCTIONAL_TAGS` exclusion + age-parse logic from `bookstube-book.jsx`
  so Next receives clean values and never learns tag conventions.
- `paragraphs`: same extraction the SSR uses in `react-helmet-ssr.js` (`getBookSeo`) — strip HTML,
  split by text boxes, in page order.

---

## Open items

- Confirm with Galaxy support whether a collection-scoped read-only Mongo user is possible
  (gates the Phase-5 direct-connect option).
- i18n library choice (`next-intl` proposed).
- Server-side conversion tracking (CAPI) on Vercel — v1 client pixel only; revisit later.
- Reader + API host: **`library.booksgiant.com`** (resolved — user owns it). Confirm it's a Galaxy
  custom domain on the school app and not already serving content you want indexed.
