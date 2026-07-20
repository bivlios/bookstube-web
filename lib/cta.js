// Keep visitors inside BooksTube for the embedded creator. The external helper is
// reserved exclusively for the iframe source.
const CREATOR_LANGS = new Set(['he', 'en', 'ar', 'de']);

const conversionParams = (content) => new URLSearchParams({
  utm_source: 'bookstube',
  utm_medium: 'referral',
  utm_campaign: 'bookstube_conversion',
  utm_content: content,
});

export const bookstubeCreateCta = (lang, content = 'cta') => {
  const safeLang = CREATOR_LANGS.has(lang) ? lang : 'he';
  return `/${safeLang}/create?${conversionParams(content).toString()}`;
};

export const tubeCreateAnonymCta = (lang, content = 'cta') => {
  const safeLang = CREATOR_LANGS.has(lang) ? lang : 'he';
  return `https://tube.booksgiant.com/create-anonym/${safeLang}?${conversionParams(content).toString()}`;
};

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bookstube.ai';

// OG/share image (lives on the school S3 bucket).
export const OG_IMAGE =
  'https://s3-eu-west-1.amazonaws.com/school.booksgiant.com/lib_thumb.jpg';
