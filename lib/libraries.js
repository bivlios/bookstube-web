// Curated collections shown in the library switcher.
//
// This replaces the old DB-driven AppSettings 'bookstube'.libraries list — edit
// here and `git push`; Vercel redeploys. No Meteor deploy, no DB write.
//
// `tags` defines the collection's CONTENT: books carrying any of these tags (tag
// books via the taglib pencil dialog on school.booksgiant.com). It's passed straight
// to the read API — no TagLibraries doc needed on the Books Giant side anymore.
// `id` is kept as a stable identifier (and legacy /taglib/<id> URL fallback); it no
// longer has to match a real TagLibraries._id. `slug` is the friendly URL segment —
// the pill links to /[lang]/taglib/[slug] (e.g. /he/taglib/social); falls back to the
// id when omitted. Keep slugs unique. `home: true` marks the collection served at "/"
// (its pill links to /[lang], and its tags fill the home page grid).
//
// Which collections each site language shows — and their pill order — comes from
// LIBRARY_ORDER below, not from this array's order.
export const LIBRARIES = [
    {
        id: 'popular',
        slug: 'popular',
        home:true,
        tags: ['popular'],
        names: { he: 'פופלרים' },
    },
    {
    id: 'dSqkJSLTGuDZDit9x',
      slug: 'best',
      tags: ['bookstube'],
      names: { he: 'ספרים נבחרים', en: 'Written By Kids', ar: 'مكتبة BooksTube', de: 'BooksTube-Bibliothek' },
  },{
    id: 'bookstube',
      slug: 'bookstube',
      tags: ['bookstube', 'publicLib', 'popular'],
      names: { he: 'ילדים כתבו', en: 'Written By Kids', ar: 'مكتبة BooksTube', de: 'BooksTube-Bibliothek' },
  },
  {
    id: 'srt',
    slug: 'srt',
    tags: ['srt'],
    names: { he: 'סיירת' },
  },

  {
    id: 'Zzfbr5RfDhNkAXFEs',
    slug: 'ai',
    tags: ['educational', 'tube', 'ai', 'AI'],
    names: { he: 'ספרים של הבינה', en: 'AI Books', ar: 'كتب الذكاء الاصطناعي', de: 'KI-Bücher' },
    intro: {
      he: 'ספרים שילדים יצרו יחד עם בינה מלאכותית בענק של ספרים — סיפורים מאוירים לקריאה חינם.',
      en: 'Books kids created together with AI on Books Giant — illustrated stories, free to read.',
      ar: 'كتب أنشأها أطفال مع الذكاء الاصطناعي في Books Giant — قصص مصوّرة للقراءة مجانًا.',
      de: 'Bücher, die Kinder gemeinsam mit KI auf Books Giant erstellt haben — illustrierte Geschichten, kostenlos zu lesen.',
    },
  },
  {
    id: 'LGQkYfmCtME9jRmky',
    slug: 'educational',
    tags: ['#תוכן_חינוכי', 'tube-edu'],
    names: { he: 'ספרי מידע', en: 'Educational', ar: 'كتب تعليمية', de: 'Wissensbücher' },
    intro: {
      he: 'ספרי מידע ולמידה לילדים — מדע, טבע, היסטוריה ועוד, כתובים בגובה העיניים ומאוירים.',
      en: 'Educational books for kids — science, nature, history and more, written simply and illustrated.',
      ar: 'كتب تعليمية للأطفال — علوم وطبيعة وتاريخ والمزيد، مكتوبة ببساطة ومصوّرة.',
      de: 'Wissensbücher für Kinder — Wissenschaft, Natur, Geschichte und mehr, einfach geschrieben und illustriert.',
    },
  },
  {
    id: 'QtHLzJNMGymvXbwQA',
    slug: 'social',
    tags: ['social-story'],
    names: { he: 'סיפורים חברתיים', en: 'Social Stories', ar: 'القصص الاجتماعية', de: 'Soziale Geschichten' },
    intro: {
      he: 'סיפורים חברתיים עוזרים לילדים להתכונן למצבים יומיומיים — ביקור אצל רופא, התחלת בית ספר, יצירת חברויות. כאן תמצאו סיפורים חברתיים מאוירים בחינם, לקריאה אונליין וגם עם הקראה.',
      en: 'Social stories help children prepare for everyday situations — visiting the doctor, starting school, making friends. Free illustrated social stories to read online, with audio narration.',
      ar: 'القصص الاجتماعية تساعد الأطفال على الاستعداد للمواقف اليومية — زيارة الطبيب، بدء المدرسة، تكوين الصداقات. قصص اجتماعية مصوّرة مجانية للقراءة عبر الإنترنت مع سرد صوتي.',
      de: 'Soziale Geschichten helfen Kindern, sich auf Alltagssituationen vorzubereiten — Arztbesuch, Schulstart, Freundschaften. Kostenlose illustrierte soziale Geschichten zum Online-Lesen, mit Vorlesefunktion.',
    },
  },
    {
    id: 'cKdFSxJzBy7R5XuTi',
    slug: 'Abtikar',
    tags: ['AbtikarLip'],
    names: { he: 'סיפורים חברתיים', en: 'Social Stories', ar: 'القصص الاجتماعية', de: 'Soziale Geschichten' },
    intro: {
      he: 'סיפורים חברתיים עוזרים לילדים להתכונן למצבים יומיומיים — ביקור אצל רופא, התחלת בית ספר, יצירת חברויות. כאן תמצאו סיפורים חברתיים מאוירים בחינם, לקריאה אונליין וגם עם הקראה.',
      en: 'Social stories help children prepare for everyday situations — visiting the doctor, starting school, making friends. Free illustrated social stories to read online, with audio narration.',
      ar: 'القصص الاجتماعية تساعد الأطفال على الاستعداد للمواقف اليومية — زيارة الطبيب، بدء المدرسة، تكوين الصداقات. قصص اجتماعية مصوّرة مجانية للقراءة عبر الإنترنت مع سرد صوتي.',
      de: 'Soziale Geschichten helfen Kindern, sich auf Alltagssituationen vorzubereiten — Arztbesuch, Schulstart, Freundschaften. Kostenlose illustrierte soziale Geschichten zum Online-Lesen, mit Vorlesefunktion.',
    },
  },

];

// Home page "Featured Book" pick, curated instead of automatic. Entries are book
// slugs (or raw bookIds), in priority order — the home page tries each in turn,
// preferring one whose orig_language matches the visitor's site language, and picks
// the first one that still resolves (a slug can go stale if a book is deleted). If
// the list is empty or nothing resolves, the home page falls back to its old
// heuristic (first book in the grid that has a summary).
export const FEATURED_BOOKS = ["tQhmW37ceHKZPjRFe","kmWwXS5RPsDzqEm6z","Sah38w4kETuQFmYZh"];

// Per-language switcher: which collections each site language shows, in pill order
// (entries are slugs, falling back to ids for slug-less collections). A collection
// missing from a language's list gets no pill and no sitemap entry there (its direct
// /taglib/ link still renders, but noindexed). Reorder freely per language.
export const LIBRARY_ORDER = {
  he: ['popular',  'ai', 'bookstube','srt',   'educational', 'social'],
  en: ['bookstube', 'ai', 'educational', 'social'],
  ar: ['Abtikar', 'ai', 'educational', 'social'],
  de: ['bookstube', 'ai', 'educational', 'social'],
};

const orderFor = (lang) => LIBRARY_ORDER[lang] || LIBRARY_ORDER.he;

// Whether a collection belongs in the given site language.
export const libInLang = (lib, lang) => orderFor(lang).includes(libSlug(lib));

// The collections to show (pills, sitemap) for a given site language, in that
// language's LIBRARY_ORDER.
export const librariesFor = (lang) =>
  orderFor(lang)
    .map((seg) => LIBRARIES.find((l) => libSlug(l) === seg))
    .filter(Boolean);

// Localized intro paragraph for a library's collection page (also its meta
// description) — SEO copy, only present on curated entries.
export const libIntro = (lib, lang) =>
  (lib && lib.intro && (lib.intro[lang] || lib.intro.en)) || null;

export const libName = (lib, lang) =>
  (lib.names && (lib.names[lang] || lib.names.en || lib.names.he)) || lib.id;

// The URL segment for a library — its friendly slug, or the id when none is set.
export const libSlug = (lib) => lib.slug || lib.id;

// A collection's tags as the API's comma-separated `tags` param (null when the
// entry has no tags — callers then fall back to the legacy `lib` id param).
export const libTagsParam = (lib) => (lib?.tags?.length ? lib.tags.join(',') : null);

// The collection whose books show at "/" (whichever entry has `home: true`) — drives
// the home page's own data fetch, not just where pills link. Falls back to
// 'bookstube' (the read API's own DEFAULT_LIB) if nothing is flagged.
const HOME_LIB = LIBRARIES.find((l) => l.home) || LIBRARIES.find((l) => l.id === 'bookstube') || {};
export const HOME_LIB_ID = HOME_LIB.id || 'bookstube';
export const HOME_LIB_TAGS = libTagsParam(HOME_LIB);

// The broad default pool: the "related books" strip on book pages and the sitemap's
// books index draw from these tags (the site-wide catalog, not one narrow collection).
export const DEFAULT_POOL_TAGS = ['bookstube', 'publicLib', 'popular'].join(',');

export const libHref = (lib, lang) => (lib.home ? `/${lang}` : `/${lang}/taglib/${libSlug(lib)}`);

// Resolve a taglib URL segment to its library entry. Matches the friendly slug first, then
// falls back to a raw id so legacy /taglib/<id> links keep working. Deliberately not
// language-scoped — direct links in any language must still resolve.
export const libBySlug = (seg) =>
  LIBRARIES.find((l) => l.slug === seg) || LIBRARIES.find((l) => l.id === seg) || null;

// The localized name for a given library id (used for the collection page heading).
export const libNameById = (id, lang) => {
  const lib = LIBRARIES.find((l) => l.id === id);
  return lib ? libName(lib, lang) : null;
};
