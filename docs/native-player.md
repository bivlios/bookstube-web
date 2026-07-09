# Native book player (`react-pageflip`) + RTL support

The "Read now" button opens one of two readers, chosen per-book:

- **Native flipbook** (`components/BookReader.js`) — for **published** books, renders the static
  page JPEGs with `react-pageflip`. No iframe, no Meteor.
- **Iframe** (`components/ReaderButton.js`) — fallback for unpublished books, embeds the existing
  Meteor `/sample-book` viewer.

The swap is data-driven in `app/[lang]/books/[slug]/page.js`:

```jsx
book.reader?.published && book.reader.pageCount > 0
  ? <BookReader pages={book.reader.pageImages} rtl={bDir === 'rtl'} … />
  : <ReaderButton readerUrl={book.readerUrl} … />
```

`book.reader` comes from the read API (`GET /api/bookstube/book/:slug`):

```jsonc
"reader": {
  "published": true,
  "pageCount": 16,
  "pageWidth": 450,
  "pageHeight": 450,
  "pageImages": ["https://…/books/pages/{bookId}/0.jpeg", … ],  // ordered, page text baked in
  "tts": true,                                                  // any page has narration
  "pageAudio": ["https://…/books/tts/{bookId}/0.wav", null, … ] // aligned with pageImages; null = silent page
}
```

So a book flips to the native player automatically once it's `pages_published` on the Meteor side —
no deploy toggle here. Unpublished books keep the iframe.

## Why `react-pageflip`

`react-pageflip` (a maintained React wrapper over **StPageFlip**) replaces the old Meteor viewer's
**turn.js (jQuery)** flipbook. Published pages are static JPEGs with the page text baked into the
image, so the reader just renders `<img>` pages — no Fabric pipeline, no `booksText` overlay, no
jQuery.

Implementation notes:
- Imported **lazily** on open (`import('react-pageflip')` inside a `useEffect`) so it never runs
  during SSR and refs resolve correctly. Keeps it out of the initial bundle.
- `new PageFlip(el, props)` inside the wrapper forwards **all** props straight through as StPageFlip
  settings, and renders children in array order — the two levers the RTL support relies on
  (`startPage` and child order).
- Fullscreen dialog, Escape-to-close, body scroll-lock, keyboard arrows, page counter, per-page
  `onError` (hides a broken page instead of blanking the book).

## RTL support (he / ar)

**Problem:** StPageFlip has **no native RTL mode**. Left to itself it lays every book out
left-to-right — cover on the right, flipping leftward, spreads with the earlier page on the left.
For a Hebrew/Arabic book that reads *backwards*: you'd start at what should be the last page.

**Fix (in `BookReader.js`, no extra dependency):** reverse the page array before handing it to the
engine, and translate indices back on the way out so the reader never sees the reversal.

1. **Reverse the pages** when `rtl`:
   ```js
   const displayPages = rtl ? [...pages].reverse() : pages;
   ```
   Logical page 0 becomes the last child, i.e. the rightmost page — so the book opens on the right
   and flips right-to-left, the natural Hebrew/Arabic direction.

2. **Open on the cover** via the reversed index:
   ```js
   const startPageIndex = rtl ? total - 1 : 0;   // passed as <Flip startPage={…}>
   ```

3. **Keep page numbers natural.** The engine reports its own (reversed) internal index; convert it
   back to the logical page for everything the reader sees — counter, state, etc.:
   ```js
   const toLogical = (i) => (rtl ? total - 1 - i : i);
   // onFlip={(e) => setPage(toLogical(e.data))}
   ```

4. **Logical navigation.** "Next" always advances the story. In the reversed array that means moving
   toward a *lower* internal index, i.e. the engine's `flipPrev`:
   ```js
   const goNext = () => (rtl ? pageFlip().flipPrev() : pageFlip().flipNext());
   const goPrev = () => (rtl ? pageFlip().flipNext() : pageFlip().flipPrev());
   ```
   Arrow keys map to physical book direction (the right arrow always turns the right-hand page).
   Button glyphs flip too (`‹`/`›`) so "previous" always points back toward the start of the book.

### Why not the `react-pageflip-rtl` package

There **is** a published fork, [`react-pageflip-rtl`](https://www.npmjs.com/package/react-pageflip-rtl),
that adds an `rtl` prop doing exactly the above (reverse array, remap `startPage`, remap
`onFlip`/`onInit`/`onUpdate`, proxy `flipNext`/`flipPrev`/`turnToPage`). We reviewed its full diff —
it's clean and MIT — but chose **not** to depend on it: it's a single-author package, 0 GitHub
stars/forks, created and published in a single day, ~145 downloads/month. For something this central
to the reading experience, the ~30-line inline port carries less supply-chain risk and matches the
"fresh build over static images, no legacy deps" approach in [`migration.md`](migration.md).

> The npm page was surfaced via `store.boilerplate.com`, a generic "buy/sell boilerplate"
> marketplace — that page is SEO chaff with no real content; the underlying npm package is the only
> real artifact.

## Verification

Verified in a headless browser against the live API and a **real published Hebrew book**
(`למה-הפנדות-צמחוניות`, 16 pages):

| Case | Result |
|---|---|
| Desktop RTL (spread) | Cover on the right, opens leftward; Hebrew text on the right page of each spread; reads forward in correct order. |
| Desktop LTR (regression) | Cover right, text on the left page — exact mirror of RTL; unchanged behavior. |
| Mobile RTL (single-page) | Correct order, counter 1 → 2 → 3. |
| Page counter | Monotonic and symmetric both directions (RTL 1→3→5…, LTR 1→2→4…; steps of 2 in spread mode, 1 in single-page). |
| Console / build | No runtime errors; `next build` passes clean. |

A useful manual-test recipe: temporarily add an `app/[lang]/reader-test/page.js` that renders two
`<BookReader>`s (one `rtl`, one `rtl={false}`) over the same `pageImages`, open both, and compare.
(The route must live under `[lang]/` — the locale middleware redirects any locale-less path.)

## TTS narration

Narrated books play their **pre-generated** per-page audio (Google TTS, rendered once by the
Meteor admin tools — `generateBookTTS` in `imports/modules/book/publish-tts.js` — and uploaded
to S3 at `books/tts/{bookId}/{i}.{mp3|wav}`, public-read). The mapping source of truth is the
book's `ttsAudio` field (`{ [pageId]: url }`); the read API converts it to an ordered
`reader.pageAudio[]` aligned with `pageImages` (null for silent pages) — file paths are never
guessed client-side (extension varies, text-less pages have no file).

In `BookReader.js` (mirrors the Meteor viewer's auto-read in `book-control-bar.jsx`):

- A 🔊 button appears in the controls **only when** `pageAudio` has any URL.
- Toggling on plays the visible spread's audio in story order (`new Audio(url)`), then flips
  forward (`goNext()` — RTL-aware) and continues; silent spreads advance after ~0.9s.
- Any manual flip mid-narration restarts narration on the new spread; a generation counter
  (`narrGen`) invalidates stale playback chains.
- Narration stops on the last page, on toggle-off, and on close (the component stays mounted
  while hidden, so close explicitly kills the audio).

The button simply doesn't render until the Meteor API ships `pageAudio` (Galaxy deploy) —
forward-compatible. For local QA without the deploy, `app/[lang]/reader-test/page.js` feeds
BookReader real S3 pages + audio directly.

## Known limitations / follow-ups

- TTS is **pre-generated only** — books without stored audio get no narration button (no
  on-the-fly synthesis in the Next app; a Next API route mirroring `convertGoogleTextToSpeech`
  is the later option per migration.md Phase 5).
- Books flip to the native player only after they're batch-published (`/utils` admin tool on
  Meteor). Until a library is fully published, expect a mix of native + iframe readers.
- Batch TTS generation is still stubbed in the Meteor `bookstube-batch-publish` tool — books
  are narrated one-by-one from the admin/book viewer today.
