import '../globals.css';
import { Suspense } from 'react';
import { LOCALES, DEFAULT_LOCALE, dir, makeT } from '@/lib/i18n';
import { SITE_URL } from '@/lib/cta';
import Header from '@/components/Header';
import HeaderHeightSync from '@/components/HeaderHeightSync';
import Analytics from '@/components/Analytics';
import GARouteTracker from '@/components/GARouteTracker';

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
        <footer className="site-footer">© {new Date().getFullYear()} BooksTube · booksgiant.com</footer>
      </body>
    </html>
  );
}
