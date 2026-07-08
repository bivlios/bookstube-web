/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Covers are served from the S3 bucket; declared here in case you switch to next/image later.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 's3-eu-west-1.amazonaws.com' },
    ],
  },
};

module.exports = nextConfig;
