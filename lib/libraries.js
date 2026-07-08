// Curated collections shown in the library switcher.
//
// This replaces the old DB-driven AppSettings 'bookstube'.libraries list — edit
// here and `git push`; Vercel redeploys. No Meteor deploy, no DB write.
//
// `id` is the TagLibraries._id on the Books Giant side (must match a real library
// the read API knows). `home: true` marks the default collection served at "/"
// (its pill links to /[lang]); every other pill links to /[lang]/taglib/[id].
// Reorder freely — the array order is the pill order.
export const LIBRARIES = [
  {
    id: 'bookstube',
    home: true,
    names: { he: 'ילדים כתבו', en: 'BooksTube Library', ar: 'مكتبة BooksTube', de: 'BooksTube-Bibliothek' },
  },
  {
    id: 'Zzfbr5RfDhNkAXFEs',
    names: { he: 'ספרים של הבינה', en: 'AI Books', ar: 'كتب الذكاء الاصطناعي', de: 'KI-Bücher' },
  },
  {
    id: 'LGQkYfmCtME9jRmky',
    names: { he: 'ספרי מידע', en: 'Educational', ar: 'كتب تعليمية', de: 'Wissensbücher' },
  },
  {
    id: 'QtHLzJNMGymvXbwQA',
    names: { he: 'סיפורים חברתיים', en: 'Social Stories', ar: 'القصص الاجتماعية', de: 'Soziale Geschichten' },
  },
];

export const libName = (lib, lang) =>
  (lib.names && (lib.names[lang] || lib.names.en || lib.names.he)) || lib.id;

export const libHref = (lib, lang) => (lib.home ? `/${lang}` : `/${lang}/taglib/${lib.id}`);

// The localized name for a given library id (used for the collection page heading).
export const libNameById = (id, lang) => {
  const lib = LIBRARIES.find((l) => l.id === id);
  return lib ? libName(lib, lang) : null;
};
