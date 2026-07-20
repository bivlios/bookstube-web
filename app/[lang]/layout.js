import '../globals.css';
import { Suspense } from 'react';
import { LOCALES, DEFAULT_LOCALE, dir, makeT } from '@/lib/i18n';
import { SITE_URL } from '@/lib/cta';
import Header from '@/components/Header';
import HeaderHeightSync from '@/components/HeaderHeightSync';
import Analytics from '@/components/Analytics';
import GARouteTracker from '@/components/GARouteTracker';
import FeedbackFloat from '@/components/FeedbackFloat';
import TrackedCreateLink from '@/components/TrackedCreateLink';
import { bookstubeCreateCta } from '@/lib/cta';

// This is the root layout (all routes are locale-prefixed via middleware).
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: '/images/robi_icon.png',
    shortcut: '/images/robi_icon.png',
    apple: '/images/robi_icon.png',
  },
};

export default function RootLayout({ children, params }) {
  const lang = LOCALES.includes(params.lang) ? params.lang : DEFAULT_LOCALE;
  const t = makeT(lang);
  return (
    <html lang={lang} dir={dir(lang)}>
      <body>
        <Analytics />
        <Suspense fallback={null}>
          <GARouteTracker />
        </Suspense>
        <Header lang={lang} t={t} />
        <HeaderHeightSync />
        {children}
        <FeedbackFloat lang={lang} t={t} />
        <footer className="site-footer">
          <span>© {new Date().getFullYear()} BooksTube · booksgiant.com</span>
          <span className="site-footer-separator" aria-hidden="true">·</span>
          <a className="site-footer-feedback" href={`/${lang}/feedback`}>
            {t('feedbackPage.footerLink')}
          </a>
          <span className="site-footer-separator" aria-hidden="true">·</span>
          <TrackedCreateLink
            className="site-footer-create"
            href={bookstubeCreateCta(lang, 'footer_create')}
            ctaLocation="footer_create"
          >
            {t('bookstubeHome.heroWriteCta')}
          </TrackedCreateLink>
        </footer>
      </body>
    </html>
  );
}
