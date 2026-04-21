/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.myanimelist.net' },
      { protocol: 'https', hostname: 'myanimelist.net' },
    ],
  },
  experimental: { serverActions: { bodySizeLimit: '10mb' } },
}
module.exports = nextConfig