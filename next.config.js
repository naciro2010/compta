/** @type {import('next').NextConfig} */
const isMobile = process.env.BUILD_TARGET === 'mobile';

const nextConfig = {
  output: 'export',
  basePath: isMobile ? '' : '/compta',
  assetPrefix: isMobile ? '' : '/compta/',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
