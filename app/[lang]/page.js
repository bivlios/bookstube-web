import { getLibrary, getBook } from '@/lib/api';
import { makeT, dir, LOCALES } from '@/lib/i18n';
import { topicKey, topicByTag } from '@/lib/topics';
import { libNameById } from '@/lib/libraries';
import { OG_IMAGE } from '@/lib/cta';
import Hero from '@/components/Hero';
import LibrarySwitcher from '@/components/LibrarySwitcher';
import TopicCards from '@/components/TopicCards';
import LangFilter from '@/components/LangFilter';
import FeaturedBook from '@/components/FeaturedBook';
import AnimatedLibrary from '@/components/AnimatedLibrary';
import ParentValue from '@/components/ParentValue';
import Cta from '@/components/Cta';
import MakeBookBanner from '@/components/MakeBookBanner';

export const revalidate = 300;
const LIMIT = 60; // up to six shelves of 10 per page (see BookShelf / PER_SHELF)

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params, searchParams }) {
  const t = makeT(params.lang);
  const title = t('meta.bookstubeTitle');
  const description = t('meta.bookstubeDesc');
  // ?topic= filtered views duplicate the topic landing pages — canonicalize there.
  const topic = topicByTag(searchParams?.topic || '');
  return {
    title,
    description,
    alternates: {
      canonical: topic ? `/${params.lang}/topics/${topic.tag}` : `/${params.lang}`,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])),
    },
    openGraph: { title, description, url: `/${params.lang}`, type: 'website', images: [OG_IMAGE] },
    twitter: { card: 'summary_large_image', title, description, images: [OG_IMAGE] },
  };
}

export default async function LibraryHome({ params, searchParams }) {
  const { lang } = params;
  const t = makeT(lang);
  const topic = searchParams?.topic || undefined;
  const bookLang = LOCALES.includes(searchParams?.bookLang) ? searchParams.bookLang : undefined;
  const skip = Number(searchParams?.skip) || 0;

  const data = (await getLibrary({ lang, topic, bookLang, skip, limit: LIMIT })) || {
    books: [],
    total: 0,
  };

  // Filtered view (topic and/or language): the API filters + paginates server-side,
  // so we just render the returned page as a single crawlable grid.
  if (topic || bookLang) {
    const heading = topic
      ? t(`bookstubeHome.${topicKey(topic) || ''}`)
      : t(`bookstubeHome.booksIn_${bookLang}`);
    return (
      <main dir={dir(lang)}>
        <LibrarySwitcher lang={lang} activeId="bookstube" t={t} />
        {/* While a language filter is active the facet reflects the filtered set,
            so only pass it on the unfiltered view — pills must not vanish mid-use. */}
        <LangFilter t={t} active={bookLang} basePath={`/${lang}`} topic={topic}
                    availableLangs={bookLang ? undefined : data.availableLangs} />
        <TopicCards t={t} lang={lang} active={topic} availableTags={data.availableTags} />
        <MakeBookBanner lang={lang} t={t} />
        <section id="library" className="library">
          <h2 className="section-title">
            {heading}
            {data.total ? <span className="lib-count">{data.total} {t('tagLibrary.books')}</span> : null}
          </h2>
          {data.books.length ? (
            <AnimatedLibrary
              lang={lang}
              topic={topic}
              bookLang={bookLang}
              initialBooks={data.books}
              total={data.total}
              limit={LIMIT}
              initialSkip={skip}
              basePath={`/${lang}`}
            />
          ) : (
            <p className="empty">{t('groups.noBooks')}</p>
          )}
        </section>
        <Cta t={t} lang={lang} />
      </main>
    );
  }

  // Home view: prioritize books whose original language matches the UI language. This is
  // a dedicated server-side filtered fetch (not a client-side split of the mixed `data`
  // page above) so a full LIMIT of same-language books fills the grid, instead of whatever
  // fraction of one mixed page happened to match.
  const langData = await getLibrary({ lang, bookLang: lang, skip, limit: LIMIT }).catch(() => null);
  // Require at least a full shelf's worth before preferring the language-filtered set —
  // a couple of stray matches would otherwise starve the grid down to a near-empty page.
  const hasLangBooks = (langData?.books?.length || 0) >= 10;
  const primary = hasLangBooks ? langData.books : data.books;
  const primaryTotal = hasLangBooks ? langData.total : data.total;

  // Featured: prefer a same-language book with a summary; fetch its detail for facts.
  const pick = primary.find((b) => b.summery) || data.books.find((b) => b.summery) || data.books[0];
  const featured = pick
    ? await getBook(pick.slug || pick.bookId, { seo: 1 }).catch(() => null)
    : null;

  const covers = data.books.slice(0, 6).map((b) => b.coverUrl);

  return (
    <main dir={dir(lang)}>
      <LibrarySwitcher lang={lang} activeId="bookstube" t={t} />
      <Hero t={t} covers={covers} />
      <LangFilter t={t} basePath={`/${lang}`} availableLangs={data.availableLangs} />
      {featured ? <FeaturedBook data={featured} lang={lang} t={t} /> : null}
      <TopicCards t={t} lang={lang} availableTags={data.availableTags} />
      <MakeBookBanner lang={lang} t={t} />

      <section id="library" className="library">
        <h2 className="section-title">
          {libNameById('bookstube', lang)}
          {primaryTotal ? <span className="lib-count">{primaryTotal} {t('tagLibrary.books')}</span> : null}
        </h2>
        {primary.length ? (
          <AnimatedLibrary
            lang={lang}
            prioritizeLang
            initialBooks={primary}
            total={primaryTotal}
            limit={LIMIT}
            initialSkip={skip}
            basePath={`/${lang}`}
          />
        ) : (
          <p className="empty">{t('groups.noBooks')}</p>
        )}
      </section>

      {/* "Other languages" shelf hidden for now — it wasn't clear alongside the
          client-paginated popular grid. Revisit later. */}

      <ParentValue t={t} />
      <Cta t={t} lang={lang} />
    </main>
  );
}
