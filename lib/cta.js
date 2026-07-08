// Outbound conversion links to the creation platform, with consistent UTM tags.
export const tubeCta = (content = 'cta') =>
  `https://tube.booksgiant.com/?utm_source=bookstube&utm_medium=referral&utm_campaign=bookstube_library&utm_content=${content}`;

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bookstube.ai';

// OG/share image (lives on the school S3 bucket).
export const OG_IMAGE =
  'https://s3-eu-west-1.amazonaws.com/school.booksgiant.com/lib_thumb.jpg';
