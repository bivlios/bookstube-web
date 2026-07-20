import { makeT, dir, LOCALES } from '@/lib/i18n';
import { tubeCreateAnonymCta } from '@/lib/cta';
import BackButton from '@/components/BackButton';
import TrackedCreateLink from '@/components/TrackedCreateLink';

// Dedicated home for the creator embed (see components/Cta.js for why it isn't
// inlined on content pages: the embedded app auto-focuses an input on load, and
// browsers scroll cross-origin frames into view when that happens — jarring on a
// page full of unrelated content, expected here since this page's only job is the
// embed). noindex: same tool as tube.booksgiant.com, nothing unique to rank for.
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }) {
  const t = makeT(params.lang);
  return { title: t('bookstubeHome.ctaTitle'), robots: { index: false } };
}

export default function CreatePage({ params }) {
  const { lang } = params;
  const t = makeT(lang);
  const src = tubeCreateAnonymCta(lang, 'create_page');

  return (
    <main dir={dir(lang)}>
      <div className="create-page-back">
        <BackButton lang={lang} label={t('bookPage.backToLibrary')} />
      </div>
      <section className="convert">
        <h1>{t('bookstubeHome.ctaTitle')}</h1>
        <p>{t('bookstubeHome.ctaText')}</p>
        <p className="cta-iframe-hint">{t('bookstubeHome.ctaIframeHint')}</p>
        <TrackedCreateLink
          className="btn btn-cta create-page-mobile-cta"
          href={src}
          ctaLocation="create_page_mobile"
          target="_blank"
          rel="noopener"
        >
          {t('bookstubeHome.ctaButton')}
        </TrackedCreateLink>
        <iframe
          className="cta-iframe"
          width="1200"
          height="800"
          src={src}
          title={t('bookstubeHome.ctaTitle')}
        />
      </section>
    </main>
  );
}
