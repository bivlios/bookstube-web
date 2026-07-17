// Per-language switcher: which collections each site language shows, in pill order
// (entries are slugs). THE FIRST ENTRY IS THAT LANGUAGE'S HOME — its tags fill the
// home page grid at /[lang] and its pill links there. A collection missing from a
// language's list gets no pill and no sitemap entry there (its direct /taglib/ link
// still renders, but noindexed). Reorder freely per language.

export const LIBRARY_ORDER = {
    he: ['narrated', 'educational', 'social', 'popular',  'ai', 'bookstube','srt' ],
    en: [ 'educational','narrated', 'bookstube', 'ai-en', 'social','english'],
    ar: ['Abtikar'],
    de: ['bookstube'],
};




// Curated collections shown in the library switcher.
//
// This replaces the old DB-driven AppSettings 'bookstube'.libraries list — edit
// here and `git push`; Vercel redeploys. No Meteor deploy, no DB write.
//
// `tags` defines the collection's CONTENT: books carrying ANY of these tags (tag
// books via the taglib pencil dialog on school.booksgiant.com). It's passed straight
// to the read API — no TagLibraries doc needed on the Books Giant side anymore.
// Set `match: 'all'` (the exact string — anything else, including omitting the field,
// means the default ANY) to require EVERY tag instead (an intersection) — e.g.
// tags: ['social-story', 'lang:ar'] + match: 'all' → only Arabic social stories.
// `id` is optional: a legacy TagLibraries._id kept for old /taglib/<id> URLs and as
// the pre-tags API fallback. `slug` is the friendly URL segment — the pill links to
// /[lang]/taglib/[slug] (e.g. /he/taglib/social). Keep slugs unique.
//
// `featured` (optional) is a curated "Featured Book" pick for when this entry is a
// language's HOME (see LIBRARY_ORDER below) — an array of book slugs/bookIds, tried
// in priority order on the home page; the visitor's language is preferred among
// resolved candidates. Only read on the home entry, so it's naturally per-language:
// each language's home can be a different entry with its own list.
//
// This array only DEFINES collections. Which ones each site language shows, their
// pill order, and which one is that language's HOME (served at "/") all come from
// LIBRARY_ORDER below — the first entry in a language's list is its home.
export const LIBRARIES = [
    {
        id: 'popular',
        slug: 'popular',
        tags: ['popular'],
        featured: ["tQhmW37ceHKZPjRFe","kmWwXS5RPsDzqEm6z","Sah38w4kETuQFmYZh"],
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
      tags: ['publicLib'],
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
    tags: ['bookstube'],
    names: { he: 'ספרים של הבינה', en: 'AI Books', ar: 'كتب الذكاء الاصطناعي', de: 'KI-Bücher' },
    intro: {
      he: 'ספרים שילדים יצרו יחד עם בינה מלאכותית בענק של ספרים — סיפורים מאוירים לקריאה חינם.',
      en: 'Books kids created together with AI on Books Giant — illustrated stories, free to read.',
      ar: 'كتب أنشأها أطفال مع الذكاء الاصطناعي في Books Giant — قصص مصوّرة للقراءة مجانًا.',
      de: 'Bücher, die Kinder gemeinsam mit KI auf Books Giant erstellt haben — illustrierte Geschichten, kostenlos zu lesen.',
    },
  },  {
    id: 'Zzfbr5RfDhNkAXFEs',
    slug: 'ai-en',
        match:'all',
    tags: ['bookstube','lng:en'],
    names: { he: 'ספרים של הבינה', en: 'AI Books en', ar: 'كتب الذكاء الاصطناعي', de: 'KI-Bücher' },
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
      match:'all',
    tags: ['ai-edu', 'lang:en'],
    names: { he: 'ספרי מידע', en: 'Educational', ar: 'كتب تعليمية', de: 'Wissensbücher' },
    intro: {
      he: 'ספרי מידע ולמידה לילדים — מדע, טבע, היסטוריה ועוד, כתובים בגובה העיניים ומאוירים.',
      en: 'Educational books for kids — science, nature, history and more, written simply and illustrated.',
      ar: 'كتب تعليمية للأطفال — علوم وطبيعة وتاريخ والمزيد، مكتوبة ببساطة ومصوّرة.',
      de: 'Wissensbücher für Kinder — Wissenschaft, Natur, Geschichte und mehr, einfach geschrieben und illustriert.',
    },
  },
  {
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
    //id: 'cKdFSxJzBy7R5XuTi',
    slug: 'Abtikar',
    tags: ['AbtikarLip', 'lang:ar'],
    match: 'all',
    names: { he: 'סיפורים חברתיים', en: 'Social Stories', ar: 'القصص الاجتماعية', de: 'Soziale Geschichten' },
    intro: {
      he: 'סיפורים חברתיים עוזרים לילדים להתכונן למצבים יומיומיים — ביקור אצל רופא, התחלת בית ספר, יצירת חברויות. כאן תמצאו סיפורים חברתיים מאוירים בחינם, לקריאה אונליין וגם עם הקראה.',
      en: 'Social stories help children prepare for everyday situations — visiting the doctor, starting school, making friends. Free illustrated social stories to read online, with audio narration.',
      ar: 'القصص الاجتماعية تساعد الأطفال على الاستعداد للمواقف اليومية — زيارة الطبيب، بدء المدرسة، تكوين الصداقات. قصص اجتماعية مصوّرة مجانية للقراءة عبر الإنترنت مع سرد صوتي.',
      de: 'Soziale Geschichten helfen Kindern, sich auf Alltagssituationen vorzubereiten — Arztbesuch, Schulstart, Freundschaften. Kostenlose illustrierte soziale Geschichten zum Online-Lesen, mit Vorlesefunktion.',
    },
  },
    {
    //id: 'cKdFSxJzBy7R5XuTi',
    slug: 'english',
    tags: ['english'],
    names: { he: 'ספרים באנגלית', en: 'English books', ar: 'القصص الاجتماعية', de: 'Soziale Geschichten' },
    intro: {
      he: 'סיפורים חברתיים עוזרים לילדים להתכונן למצבים יומיומיים — ביקור אצל רופא, התחלת בית ספר, יצירת חברויות. כאן תמצאו סיפורים חברתיים מאוירים בחינם, לקריאה אונליין וגם עם הקראה.',
      en: 'Social stories help children prepare for everyday situations — visiting the doctor, starting school, making friends. Free illustrated social stories to read online, with audio narration.',
      ar: 'القصص الاجتماعية تساعد الأطفال على الاستعداد للمواقف اليومية — زيارة الطبيب، بدء المدرسة، تكوين الصداقات. قصص اجتماعية مصوّرة مجانية للقراءة عبر الإنترنت مع سرد صوتي.',
      de: 'Soziale Geschichten helfen Kindern, sich auf Alltagssituationen vorzubereiten — Arztbesuch, Schulstart, Freundschaften. Kostenlose illustrierte soziale Geschichten zum Online-Lesen, mit Vorlesefunktion.',
    }
    },

    {
        slug: 'narrated',
        tags: ['narrated'],
        names: { he: 'ספרים מוקראים', en: 'Narrated books', ar: 'القصص الاجتماعية', de: 'Soziale Geschichten' },
        intro: {
            he: 'קבצנו כאן עבורכם סיפורים מוקראים בנושאים שונים. סיפורים חברתייים, ספרי מידע, סיפורים של הבינה ועוד. הספרים כאן בשפות שונות. בחרו סיפור ולחצו על כפתור ההשמעה.',
            en: 'We have gathered a collection of narrated stories for you covering various topics—social stories, informational books, stories about intelligence, and more. The books are available in different languages. Simply choose a story and click the play button.',
            ar: 'لقد جمعنا لكم مجموعة من القصص المسموعة التي تتناول مواضيع متنوعة، تشمل القصص الاجتماعية، والكتب المعلوماتية، وقصصاً عن الذكاء، وغيرها. تتوفر هذه الكتب بلغات متعددة؛ ما عليكم سوى اختيار قصة والنقر على زر التشغيل.',
            de: 'Soziale Geschichten helfen Kindern, sich auf Alltagssituationen vorzubereiten — Arztbesuch, Schulstart, Freundschaften. Kostenlose illustrierte soziale Geschichten zum Online-Lesen, mit Vorlesefunktion.',
        },
  },

];


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

// The API params selecting a collection's books: `tags` (+ `match=all` when the
// entry requires every tag) for the tags-aware API, with the legacy `lib` id riding
// along so the pre-tags API keeps working until the Galaxy deploy.
export const libParams = (lib) => ({
  lib: lib?.id || undefined,
  tags: libTagsParam(lib) || undefined,
  match: lib?.match === 'all' ? 'all' : undefined,
});

// A language's home collection: the FIRST entry in its LIBRARY_ORDER — its books
// show at /[lang] and its pill links there. Different languages can have different
// homes (e.g. he → popular, ar → Abtikar).
export const homeLibFor = (lang) => librariesFor(lang)[0] || LIBRARIES[0];
export const isHomeLib = (lib, lang) => !!lib && libSlug(lib) === libSlug(homeLibFor(lang));

// This language's curated Featured Book candidates — its home entry's `featured`
// list (see LIBRARIES above), or [] if that entry has none (the home page then
// falls back to its own automatic heuristic).
export const featuredFor = (lang) => homeLibFor(lang).featured || [];

// The broad default pool: the "related books" strip on book pages and the sitemap's
// books index draw from these tags (the site-wide catalog, not one narrow collection).
export const DEFAULT_POOL_TAGS = ['bookstube', 'publicLib', 'popular'].join(',');

// `lib.home` is only honored for the `{ home: true }` sentinel HeaderSearch passes;
// real entries are home per-language via LIBRARY_ORDER position.
export const libHref = (lib, lang) =>
  (lib.home || isHomeLib(lib, lang) ? `/${lang}` : `/${lang}/taglib/${libSlug(lib)}`);

// Resolve a taglib URL segment to its library entry. Matches the friendly slug first, then
// falls back to a raw id so legacy /taglib/<id> links keep working. Deliberately not
// language-scoped — direct links in any language must still resolve.
export const libBySlug = (seg) =>
  LIBRARIES.find((l) => l.slug === seg) || LIBRARIES.find((l) => l.id === seg) || null;

