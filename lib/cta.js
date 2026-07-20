// Direct, registration-free creation route. Every creation CTA uses this helper so
// language routing and attribution stay consistent instead of drifting back to the
// platform homepage.
const CREATOR_LANGS = new Set(['he', 'en', 'ar', 'de']);

export const tubeCreateAnonymCta = (lang, content = 'cta') => {
  const safeLang = CREATOR_LANGS.has(lang) ? lang : 'he';
  const params = new URLSearchParams({
    utm_source: 'bookstube',
    utm_medium: 'referral',
    utm_campaign: 'bookstube_conversion',
    utm_content: content,
  });
  return `https://tube.booksgiant.com/create-anonym/${safeLang}?${params.toString()}`;
};

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bookstube.ai';

// OG/share image (lives on the school S3 bucket).
export const OG_IMAGE =
  'https://s3-eu-west-1.amazonaws.com/school.booksgiant.com/lib_thumb.jpg';
