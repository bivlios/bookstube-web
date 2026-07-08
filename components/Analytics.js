import Script from 'next/script';

// GA4 measurement id — public by nature (visible in page source). Env overrides the default.
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-71PTEX1YZF';

// Loads gtag. page_view is sent manually by GARouteTracker so SPA navigations are counted.
export default function Analytics() {
  if (!GA_ID) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
