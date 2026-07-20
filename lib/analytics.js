const cleanParams = (params = {}) => Object.fromEntries(
  Object.entries(params).filter(([, value]) => (
    value !== undefined && value !== null && value !== ''
    && ['string', 'number', 'boolean'].includes(typeof value)
  )),
);

export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined') return;
  // Queue early events even when the afterInteractive GA script has not loaded yet.
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
  }
  window.gtag('event', name, cleanParams(params));
}
